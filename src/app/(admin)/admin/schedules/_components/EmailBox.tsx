// import ReactQuill from "react-quill";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const EmailEditor = ({
  content,
  setContent,
}: {
  content: any;
  setContent: any;
}) => {
  // Custom toolbar configuration
  const modules = {
    toolbar: [
      //   [{ font: [] }],
      [{ header: [1, 2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
  ];

  return (
    <div className="mb-16 max-w-2xl rounded-lg">
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        modules={modules}
        formats={formats}
        placeholder="Compose your email..."
        className="rounded-lg focus:ring-2 focus:ring-blue-500"
        style={{ height: "250px", border: "0px" }}
      />
    </div>
  );
};

export default EmailEditor;
