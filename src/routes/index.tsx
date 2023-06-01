import { component$, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Texture } from "~/core/glfx/core/texture";
import { brightnessContrast } from "~/core/glfx/effects/adjust/brightnessContrast";
import { denoise } from "~/core/glfx/effects/adjust/denoise";
import { exposure } from "~/core/glfx/effects/adjust/exposure";
import { hueSaturation } from "~/core/glfx/effects/adjust/hueSaturation";
import { noise } from "~/core/glfx/effects/adjust/noise";
import { GLFX } from "~/core/glfx/glfx";

export default component$(() => {
  const canvasRef = useSignal<HTMLCanvasElement>();

  return (
    <>
      <canvas
        ref={canvasRef}
        id="cnv"
        style={{
          pointerEvents: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      ></canvas>
      <button
        onClick$={() => {
          const img = new Image();

          // Set the source of the image
          img.src = "/img.png";

          // Wait for the image to load
          img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            const canvas = canvasRef.value!;
            canvas.width = width;
            canvas.height = height;
            // ctx.drawImage(img, 0, 0);
            const glfx = new GLFX(canvas);
            const texture = Texture.fromElement(glfx, img);
            glfx.draw(texture);
            noise(glfx, 0.2);
            denoise(glfx, 10);
            brightnessContrast(glfx, 0, 0.3);
            hueSaturation(glfx, 0.05, -0.5);
            exposure(glfx, 0.2);
            glfx.update();
            // setInterval(() => {
            //   glfx.draw(texture);
            //   brightnessContrast(glfx, 0, Math.sin(Date.now() / 1000));
            //   glfx.update();
            // }, 16);
          };
        }}
      >
        Click ples
      </button>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
