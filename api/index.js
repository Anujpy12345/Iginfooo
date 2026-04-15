export default async function handler(req, res) {
  const INSTAGRAM_API_URL = "https://www.instagram.com/api/v1/users/web_profile_info/";

  const HEADERS = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "*/*",
    "X-IG-App-ID": "936619743392459",
    "Referer": "https://www.instagram.com/"
  };

  const RANGES = [
    [1279000, 2010],[17750000, 2011],[279760000, 2012],
    [900990000, 2013],[1629010000, 2014],[2500000000, 2015],
    [3713668786, 2016],[5699785217, 2017],[8597939245, 2018],
    [21254029834, 2019],[43464475395, 2020],[50289297647, 2021],
    [57464707082, 2022],[63313426938, 2023],
    [73223842087, 2024],[78313496938, 2025]
  ];

  const username = req.query.username?.trim().toLowerCase();
  const pretty = "pretty" in req.query;

  if (!username) {
    return res.status(400).json({ error: "Missing ?username=" });
  }

  if (username.length > 50 || /[^a-z0-9_.]/.test(username)) {
    return res.status(400).json({ error: "Invalid username" });
  }

  try {
    const response = await fetch(
      `${INSTAGRAM_API_URL}?username=${encodeURIComponent(username)}`,
      { headers: HEADERS }
    );

    if (!response.ok) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const json = await response.json();
    const user = json?.data?.user;

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const getYearFromId = (id) => {
      const uid = Number(id);
      for (let i = 0; i < RANGES.length; i++) {
        if (uid <= RANGES[i][0]) return RANGES[i][1];
      }
      return "unknown";
    };

    const data = {
      username: user.username,
      full_name: user.full_name,
      biography: user.biography,
      followers: user.edge_followed_by?.count || 0,
      following: user.edge_follow?.count || 0,
      posts: user.edge_owner_to_timeline_media?.count || 0,
      user_id: user.id,
      joined_year: getYearFromId(user.id)
    };

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
