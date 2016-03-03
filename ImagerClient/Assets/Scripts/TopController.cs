using UnityEngine;
using System.Collections;
using UnityEngine.SceneManagement;

public class TopController : MonoBehaviour
{
	void Start()
	{
	}

	public void OnPressCamera()
	{
		SceneManager.LoadScene("Camera");
	}

	public void OnPressView()
	{
		SceneManager.LoadScene("View");
	}
}
