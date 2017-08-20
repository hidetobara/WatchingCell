using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System;
using System.Net;
using System.IO;
using System.Text;
using System.Collections.Generic;


public class CameraController : MonoBehaviour
{
	const string NewLine = "\r\n";

	WebCamTexture _WebCam;
	Texture2D _Texture;

	public Text LogText;

	private static CameraController _Instance;
	public static CameraController Instance
	{
		get
		{
			if (_Instance == null) _Instance = FindObjectOfType<CameraController>();
			return _Instance;
		}
	}

	void Start()
	{
		Screen.sleepTimeout = SleepTimeout.NeverSleep;
		Application.targetFrameRate = 5;

		string name = null;
		foreach (var device in WebCamTexture.devices)
		{
#if !UNITY_EDITOR
			if (!device.isFrontFacing || name == null)
#endif
				name = device.name;
		}
		if (name == null)
		{
			SetLog("No devices are found. Count=" + WebCamTexture.devices.Length);
			return;
		}
		SetLog("Starting...");

		_WebCam = new WebCamTexture(name, 640, 480, 5);
		GetComponent<RawImage>().material.mainTexture = _WebCam;
		_WebCam.Play();
		_Texture = new Texture2D(_WebCam.width, _WebCam.height, TextureFormat.BGRA32, false);
	}

	public void StartUpload(string name)
	{
		DefineController.Instance = new MyDefine(name);
		StartCoroutine(Uploading());
	}

	IEnumerator Uploading()
	{
		yield return new WaitForSeconds(1f);
		while (true)
		{
			Color32[] data = _WebCam.GetPixels32();
			_Texture.SetPixels32(data);
			_Texture.Apply();
			string filename = DateTime.Now.ToString("MMddHHmm") + ".jpg";
			byte[] image = _Texture.EncodeToJPG();

			//UploadImage1(filename, image);
			StartCoroutine(UploadImage2(filename, image));

			yield return new WaitForSeconds(300f);
		}
	}

	void SaveImage(string filename, byte[] image)
	{
		string path = Path.Combine(Application.temporaryCachePath, filename);
		File.WriteAllBytes(path, image);
		Debug.Log(path);
	}

	const string Boundary = "----WebKitFormBoundaryfTPXQwdbo09gjB11";

	void UploadImage1(string filename, byte[] image)
	{
		string log = "url=" + DefineController.Instance.GetUploadUrl() +  " filename=" + filename + NewLine;
		List<byte> bytes = new List<byte>();

		try
		{
			// 始め
			bytes.AddRange(Encoding.UTF8.GetBytes("--" + Boundary + NewLine));
			// サブヘッダー
			string subheader = "Content-Disposition: form-data; name=\"userfile\"; filename=\"" + filename + "\"" + NewLine
				+ "Content-Type: image/jpeg" + NewLine
				+ "Content-Length: " + image.Length + NewLine
				+ NewLine;
			bytes.AddRange(Encoding.UTF8.GetBytes(subheader));
			// 本体
			bytes.AddRange(image);
			// 終わり
			bytes.AddRange(Encoding.UTF8.GetBytes(NewLine + "--" + Boundary + "--" + NewLine));

			WebRequest req = HttpWebRequest.Create(DefineController.Instance.GetUploadUrl());
			req.Timeout = 3000;
			req.Method = "POST";
			req.ContentType = "multipart/form-data; boundary=" + Boundary;
			req.ContentLength = bytes.Count;

			// ポスト・データの書き込み
			Stream reqStream = req.GetRequestStream();	// ここでTimeout
			reqStream.Write(bytes.ToArray(), 0, bytes.Count);
			reqStream.Close();

			// レスポンスの取得と読み込み
			WebResponse res = req.GetResponse();
			Stream resStream = res.GetResponseStream();
			StreamReader sr = new StreamReader(resStream, Encoding.UTF8);
			string result = sr.ReadToEnd();
			sr.Close();
			resStream.Close();

			log += result;
		}
		catch(Exception ex)
		{
			log += ex.Message + "@" + ex.StackTrace;
		}
		finally
		{
			SetLog(log);
		}
	}

	IEnumerator UploadImage2(string filename, byte[] image)
	{
		WWWForm form = new WWWForm();
		form.AddBinaryData("userfile", image, filename, "image/jpeg");
		WWW www = new WWW(DefineController.Instance.GetUploadUrl(), form);
		while (!www.isDone) yield return null;

		string log = null;
		if (!string.IsNullOrEmpty(www.error)) log = www.error;
		else log = www.text;

		SetLog(log);
	}

	private void SetLog(string s)
	{
		Debug.Log(s);
		LogText.text = s;
	}
}
