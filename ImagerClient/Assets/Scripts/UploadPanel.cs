using UnityEngine;
using System.Collections;
using UnityEngine.UI;

public class UploadPanel : MonoBehaviour
{
	const string NAMESPACE_KEY = "imager.namespace";

	public InputField NamespaceText;
	public Dropdown IntervalMin;

	void Start()
	{
		NamespaceText.text = PlayerPrefs.GetString(NAMESPACE_KEY, "");
	}

	public void OnPressStart()
	{
		string text = NamespaceText.text;
		Debug.Log("OnPressStart(): text=" + text);
		if (string.IsNullOrEmpty(text)) return;

		PlayerPrefs.SetString(NAMESPACE_KEY, text);
		PlayerPrefs.Save();
		gameObject.SetActive(false);

		int min = IntervalMin.value == 0 ? 60 : 5;
		CameraController.Instance.StartUpload(text, min);
	}
}
