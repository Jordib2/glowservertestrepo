import { useEffect, useState } from "react";
import { API_URL } from "../../../shared/services/api";

interface CollageItem {
  id: number;
  collage_id: number;
  video_path: string;
  school_name: string;
  class_name: string;
}

export default function StudentCollagesPage() {
  const [collages, setCollages] = useState<CollageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    // Assuming a student-specific endpoint exists, mirroring the teacher's one.
    fetch(`${API_URL}/api/my-collages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        const data = await res.json();
        console.log("StudentCollages API Response:", data); // Debug log to see what the backend is actually sending
        setCollages(Array.isArray(data) ? data : (data?.data || data?.collages || []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mt-5 flex flex-col items-center flex-1 pb-24">
      <h1 className="text-2xl md:text-4xl font-serif text-center mb-10 text-white">My Collages</h1>

      {loading ? (
        <p className="text-center text-white">Loading...</p>
      ) : (!collages || collages.length === 0) ? (
        <p className="text-center text-white">Your work has not been featured in any collages yet.</p>
      ) : (
        <div className="grid gap-6 max-w-4xl mx-auto p-5">
          {(Array.isArray(collages) ? collages : []).map((collage) => (
            <div key={collage.id} className="rounded-[15px] border-2 border-white/20 backdrop-blur-xl p-3" style={{ backgroundColor: "rgba(94, 30, 149, 0.2)" }}>
              <video src={collage.video_path} controls className="w-full rounded-lg mb-3" />
              <div className="text-white space-y-1">
                <p><span className="font-semibold">School:</span> {collage.school_name}</p>
                <p><span className="font-semibold">Class:</span> {collage.class_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
  );
}