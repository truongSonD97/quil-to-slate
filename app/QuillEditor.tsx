"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function App() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function quillGetHTML() {
    localStorage.setItem("data", JSON.stringify(value));
    router.push("/slate");
  }

  return (
    <div className="bg-white text-black min-h-screen font-sans">
      <ReactQuill
        className="h-[500px]"
        theme="snow"
        value={value}
        onChange={setValue}
      />
      <div className="mt-[100px] w-full">
        <button
          className="rounded bg-stone-800 ml-auto mr-auto flex px-10 py-4 text-white "
          onClick={quillGetHTML}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
export default App;
