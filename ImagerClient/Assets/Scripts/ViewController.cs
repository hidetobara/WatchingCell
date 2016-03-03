using UnityEngine;
using System;
using System.Collections;
using UnityEngine.UI;

public class ViewController : MonoBehaviour
{
	const string NewLine = "\r\n";

	private RawImage _RawImage;

	private static ViewController _Instance;
	public static ViewController Instance
	{
		get
		{
			if (_Instance == null) _Instance = FindObjectOfType<ViewController>();
			return _Instance;
		}
	}

	void Start()
	{
		_RawImage = GetComponent<RawImage>();
	}

	public void StartShow(string name)
	{
		DefineController.Instance = new MyDefine(name);
		StartCoroutine(Showing());
	}

	IEnumerator Showing()
	{
		while (true)
		{
			DateTime time = DateTime.Now - new TimeSpan(0, 2, 0);
			string filename = time.ToString("HHmm") + ".jpg";
			string url = DefineController.Instance.GetShowUrl() + filename;
			WWW www = new WWW(url);
			while (!www.isDone) yield return null;

			if (!string.IsNullOrEmpty(www.error))
			{
				Debug.Log(www.error + " @" + url);
			}
			else
			{
				_RawImage.texture = www.texture;
			}
			yield return new WaitForSeconds(60f);
		}
	}
}
