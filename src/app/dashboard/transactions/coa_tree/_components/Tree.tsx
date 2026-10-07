import { useAppSelector } from "@/app/redux/store";
import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { IoIosArrowForward, IoIosArrowUp } from "react-icons/io";
import { LuArrowDownFromLine } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";

interface TreeNodeProps {
  node: any;
  level?: number;
  expandAll: boolean;
  handleAdd: (uid: string) => void;
  handleEdit: (uid: string) => void;
  handleDelete: (uid: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level = 0,
  expandAll,
  handleAdd,
  handleEdit,
  handleDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
    const { Permissions } = useAppSelector((state) => state.Permissions);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  useEffect(() => {
    setIsExpanded(expandAll);
  }, [expandAll]);

  return (
    <div className="">
      <div className="flex items-center">
        {/* Expand/Collapse Icon */}
        {(node?.children?.length !== 0 || !node?.uid) && (
          <button onClick={toggleExpand} className="-ml-2">
            {isExpanded ? (
              <>
                {" "}
                <IoIosArrowUp className="text-xl font-bold text-gray-500" />
                <hr className="mt-[4px] -translate-x-[1px] -rotate-90 border border-[#007720]" />
              </>
            ) : (
              <IoIosArrowForward className="ml-1 text-xl text-gray-500" />
            )}
          </button>
        )}
        <hr
          className={`mr-1 ${(node?.children?.length !== 0 || !node?.uid) ? "w-4" : "w-8"} border border-[#007720]`}
        />
        <div className="flex items-center gap-2">
          {/* {isExpanded && node?.children?.length !== 0 && node?.uid && (
            <button
              onClick={(e) => {
                Permissions?.includes("add_chartofaccount") ? handleAdd(node.uid) : alert("You do not have permission to perform this action")
              }}
              className="text-green-500"
            >
              <LuArrowDownFromLine className="text-lg text-gray-500" />
            </button>
          )} */}
          {/* {((isExpanded || node?.children?.length == 0) && node?.uid && !node?.is_fixed) && (
            <button
              onClick={(e) => {Permissions?.includes("change_chartofaccount") ? handleEdit(node.uid) : alert("You do not have permission to perform this action")}}
              className="text-blue-500"
            >
              <FiEdit className="text-lg text-gray-500" />{" "}
            </button>
          )}
          {((isExpanded || node?.children?.length == 0) && node?.uid) && !node?.is_fixed && (
            <button
              onClick={() => Permissions?.includes("delete_chartofaccount") ? handleDelete(node.uid) : alert("You do not have permission to perform this action")}
              className="text-red-500"
            >
              <RiDeleteBin6Line className="text-lg text-gray-500" />
            </button>
          )} */}
        </div>
        <span
          className={`my-2 ml-2 flex items-center ${(node?.children?.length !== 0 || !node?.uid) ? "text-accent_primary" : "text-[#007720]"}`}
        >
          {node?._id && `[${node._id}]-`}<IoIosArrowForward className="text-sm" /> {node.title} -{" "}
          {node.code}{" "}
        </span>
      </div>

      {/* Render Children */}
      {(isExpanded && node.children) && (
        <div className="ml- border-l-2 border-[#007720]">
          {node.children.map((childNode: any) => (
            <div key={childNode.id} className="flex items-center">
              <hr className="w-10 border border-[#007720]" />{" "}
              <TreeNode
                handleAdd={handleAdd}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                node={childNode}
                level={level + 1}
                expandAll={expandAll}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
