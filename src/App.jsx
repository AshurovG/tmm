import { useState, useEffect, useRef } from "react";
import "./App.css";
import img1 from "./assets/img1.jpg";
import img2 from "./assets/img2.jpg";
import img3 from "./assets/img3.jpg";

import { Camera } from "@mediapipe/camera_utils";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import "./style.css";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesBoxRef = useRef(null);
  const buttonRef = useRef(null);

  let img$ = null;

  useEffect(() => {
    const video$ = videoRef.current;
    const canvas$ = canvasRef.current;
    const ctx = canvas$.getContext("2d");
    const imagesBox$ = imagesBoxRef.current;
    const button$ = buttonRef.current;

    const onImagesBoxClick = (e) => {
      const newSelectedImage =
        e.target.localeName === "img" ? e.target : e.target.closest("img");
      if (!newSelectedImage) return;

      const prevSelectedImage = imagesBox$.querySelector(".selected");
      if (prevSelectedImage) {
        prevSelectedImage.classList.remove("selected");
      }

      newSelectedImage.classList.add("selected");
      img$ = newSelectedImage;
    };

    const onButtonClick = () => {
      img$ = null;

      ctx.clearRect(0, 0, canvas$.width, canvas$.height);

      const selectedImage = imagesBox$.querySelector(".selected");
      if (selectedImage) {
        selectedImage.classList.remove("selected");
      }
    };

    imagesBox$.addEventListener("click", onImagesBoxClick);
    button$.addEventListener("click", onButtonClick);

    const WIDTH = (canvas$.width = window.innerWidth);
    const HEIGHT = (canvas$.height = window.innerHeight);

    function onResults(results) {
      if (!img$) return;

      ctx.save();

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.drawImage(results.segmentationMask, 0, 0, WIDTH, HEIGHT);

      ctx.globalCompositeOperation = "source-out";
      ctx.drawImage(img$, 0, 0, WIDTH, HEIGHT);

      ctx.globalCompositeOperation = "destination-atop";
      ctx.drawImage(results.image, 0, 0, WIDTH, HEIGHT);

      ctx.restore();
    }

    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) =>
        `./node_modules/@mediapipe/selfie_segmentation/${file}`,
    });
    selfieSegmentation.setOptions({
      modelSelection: 1,
    });
    selfieSegmentation.onResults(onResults);

    const camera = new Camera(video$, {
      onFrame: async () => {
        await selfieSegmentation.send({ image: video$ });
      },
      facingMode: undefined,
      width: WIDTH,
      height: HEIGHT,
    });
    camera.start();
  }, []);

  return (
    <>
      <video ref={videoRef}></video>
      <canvas ref={canvasRef}></canvas>
      {/* <img
        src="/images/nose.png"
        alt=""
        className="nose-image"
        style={{ display: "none" }}
      /> */}
      {/* <img */}
      {/* // src="/images/star.png" // alt="" // className="star-image" // style= */}
      {/* {{ display: "none" }} */}
      {/* // /> */}
      <div ref={imagesBoxRef} className="images-box">
        <img src={img1} alt="" />
        <img src={img2} alt="" />
        <img src={img3} alt="" />
      </div>
      <button ref={buttonRef}>Show real background</button>
      <script type="module" src="/selfie_segmentation.js"></script>
    </>
  );
}

export default App;
