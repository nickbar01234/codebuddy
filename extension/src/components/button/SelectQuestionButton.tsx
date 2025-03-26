interface SelectButtonQuestionProps {
  href: string;
}

const SelectQuestionButton = ({ href }: SelectButtonQuestionProps) => {
  return (
    // todo(nickbar01234) - Adding manual margin left to align the other columns. We should find a better method
    <div className="ml-7 mr-2 flex items-center py-[11px]" role="cell">
      <button
        className="rounded-md p-2 text-white"
        style={{ backgroundColor: "#DD5471" }}
        onClick={() => console.log(href)}
      >
        Select
      </button>
    </div>
  );
};

export default SelectQuestionButton;
