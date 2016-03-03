using UnityEngine;
using System.Collections;
using UnityEngine.UI;

public class ShowPanel : MonoBehaviour
{
	const string NAMESPACE_KEY = "imager.namespace";

	public InputField NamespaceText;

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

		ViewController.Instance.StartShow(text);
	}
}
