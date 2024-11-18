import { React, useState } from "react";
import "./image_upload.css";

function ImageUpload({ imagePosition, state, onFieldChange }) {
  const splitted = imagePosition.split(" ");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const imageUrl = event.dataTransfer.getData("text/uri-list");
    if (
      imageUrl &&
      (imageUrl.endsWith(".jpg") ||
        imageUrl.endsWith(".png") ||
        imageUrl.endsWith(".jpeg") ||
        imageUrl.endsWith(".webp"))
    ) {
      onFieldChange(imageUrl);
    } else {
      alert("Please drop a valid image link (JPG, PNG, JPEG, WEBP).");
    }
  };

  return (
    <div
      className={`image_upload ${(isDragOver ? 'onDrag' : (state.error !== "" ? 'invalid' : state.value === '' ? '' : 'notempty'))}`}
    >
      <div
        className="image_upload_details"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        {(state.value !== "" && state.error === "") ? (
          <img src={state.value} alt="image" className="image" />
        ) : (
          <div className="drop_text">Drop your link here</div>
        )}
      </div>
      {(state.value !== "" && state.error === "") ? null : (
        <div className="image_name">
          {splitted[0]}
          <br />
          {splitted[1]}
        </div>
      )}
    </div>
  );
}

export { ImageUpload };
