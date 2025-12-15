import { useEffect, useRef, useState } from "react";
import { BuzzMedia } from "../../features/buzz/buzzApi";

type Props = {
  onUploaded: (media: BuzzMedia[]) => void;
  upload: (fd: FormData) => Promise<BuzzMedia[]>;
  resetSignal?: number; // ✅ when changes, picker resets
};

export default function BuzzMediaPicker({ onUploaded, upload, resetSignal }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ reset file input + preview when post is submitted successfully
    setPreview([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [resetSignal]);

  async function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError(null);

    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));

      const media = await upload(form);

      onUploaded(media);
      setPreview(media.map((m) => m.url));
    } catch (e) {
      console.error("Upload failed", e);
      setError("Failed to upload media");
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => onPick(e.target.files)}
        className="text-xs"
      />

      {error && <div className="text-xs text-red-500">{error}</div>}

      {preview.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {preview.map((p) => (
            <div key={p} className="w-24 h-24 rounded-lg overflow-hidden border">
              {p.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={p} controls className="w-full h-full object-cover" />
              ) : (
                <img src={p} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
