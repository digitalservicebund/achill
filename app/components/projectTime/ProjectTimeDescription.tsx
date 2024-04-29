type ProjectTimeDescriptionProps = {
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  children: React.ReactNode;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  hasErrors: boolean;
  resetErrors: () => void;
};
export default function ProjectTimeDescription({
  description,
  setDescription,
  children,
  onKeyDown,
  hasErrors,
  resetErrors,
}: Readonly<ProjectTimeDescriptionProps>) {
  function handleDescriptionChange(
    event: React.FormEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.nativeEvent instanceof InputEvent &&
      event.target instanceof HTMLTextAreaElement
    ) {
      if (event.nativeEvent.inputType !== "insertLineBreak") {
        resetErrors();
      }
      let newDescription = event.target.value;
      setDescription(newDescription);
    } else {
      console.error("handleDescriptionChange", event);
    }
  }

  return (
    <div className="flex w-full flex-col md:flex-row items-stretch">
      <div className="w-full md:mb-0 md:mr-5">
        <textarea
          name="description"
          value={description}
          onKeyDown={onKeyDown}
          onInput={handleDescriptionChange}
          id="description"
          className={`h-full w-full leading-4 ${hasErrors ? " error" : ""} `}
          placeholder="Working the work…"
        />
      </div>
      <div className="flex flex-row space-x-2 md:flex-col md:space-x-0 md:space-y-2 self-end">
        {children}
      </div>
    </div>
  );
}
