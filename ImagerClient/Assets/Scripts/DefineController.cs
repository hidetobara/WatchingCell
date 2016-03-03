using UnityEngine;
using System.Collections;

public class DefineController : MonoBehaviour
{
	public static Define Instance;

	void Awake()
	{
		Instance = new Define();
		DontDestroyOnLoad(this.gameObject);
	}
}

public class Define
{
	protected virtual string BASE_URL { get { return "http://127.0.0.1/"; } }
	protected virtual string NAMESPACE { get { return "home"; } }

	public virtual string GetUploadUrl()
	{
		return BASE_URL + "upload/" + NAMESPACE + "/";
	}
	public virtual string GetShowUrl()
	{
		return BASE_URL + "show/" + NAMESPACE + "/";
	}
}
