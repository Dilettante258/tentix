import "./styles/index.css"

import type { Content, Editor } from "@tiptap/react"
import type { UseMinimalTiptapEditorProps } from "./hooks/use-minimal-tiptap.ts"
import { EditorContent } from "@tiptap/react"
import { Separator } from "../ui/separator"
import { cn } from "@ui/lib/utils.ts"
import { SectionOne } from "./components/section/one.tsx"
import { SectionTwo } from "./components/section/two.tsx"
import { SectionThree } from "./components/section/three.tsx"
import { SectionFour } from "./components/section/four.tsx"
import { SectionFive } from "./components/section/five.tsx"
import { LinkBubbleMenu } from "./components/bubble-menu/link-bubble-menu.tsx"
import { useMinimalTiptapEditor } from "./hooks/use-minimal-tiptap.ts"
import { MeasuredContainer } from "./components/measured-container.tsx"

export interface MinimalTiptapProps
  extends Omit<UseMinimalTiptapEditorProps, "onUpdate"> {
  value?: Content
  onChange?: (value: Content) => void
  className?: string
  editorContentClassName?: string
}

const Toolbar = ({ editor }: { editor: Editor }) => (
  <div className="border-border flex h-12 shrink-0 overflow-x-auto border-b p-2">
    <div className="flex w-max items-center gap-px">
      <SectionOne editor={editor} />

      <Separator orientation="vertical" className="mx-2" />

      <SectionTwo
        editor={editor}
        activeActions={[
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "code",
          "clearFormatting",
        ]}
        mainActionCount={3}
      />

      <Separator orientation="vertical" className="mx-2" />

      <SectionThree editor={editor} />

      <Separator orientation="vertical" className="mx-2" />

      <SectionFour
        editor={editor}
        activeActions={["orderedList", "bulletList"]}
        mainActionCount={0}
      />

      <Separator orientation="vertical" className="mx-2" />

      <SectionFive
        editor={editor}
        activeActions={["codeBlock", "blockquote", "horizontalRule"]}
        mainActionCount={0}
      />
    </div>
  </div>
)

export const MinimalTiptapEditor = ({
  value,
  onChange,
  className,
  editorContentClassName,
  ...props
}: MinimalTiptapProps) => {
  const editor = useMinimalTiptapEditor({
    value,
    onUpdate: onChange,
    ...props,
  })

  if (!editor) {
    return null
  }

  return (
    <MeasuredContainer
      as="div"
      name="editor"
      className={cn(
        "border-input focus-within:border-primary min-data-[orientation=vertical]:h-72 flex h-auto w-full flex-col rounded-md border shadow-xs",
        className
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className={cn("minimal-tiptap-editor", editorContentClassName)}
      />
      <LinkBubbleMenu editor={editor} />
    </MeasuredContainer>
  )
}

MinimalTiptapEditor.displayName = "MinimalTiptapEditor"

export default MinimalTiptapEditor
