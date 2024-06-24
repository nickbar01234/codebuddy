interface UpdateEditorLayoutArgs {
  id: string;
}

export const updateEditorLayout = (args: UpdateEditorLayoutArgs) => {
  const monaco = (window as any).monaco;
  const editor = (monaco.editor.getEditors() as any[]).find(
    (editor) => editor.id === args.id
  );

  if (editor != undefined) {
    editor.layout();
  }
};
