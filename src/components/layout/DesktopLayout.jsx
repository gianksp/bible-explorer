// Props:
//   navPanel     — ReactNode
//   passagePanel — ReactNode
//   studyPanel   — ReactNode

export default function DesktopLayout({ navPanel, passagePanel, studyPanel }) {
    return (
        <div className="hidden md:grid md:grid-cols-[200px_1fr_280px] h-full">
            {navPanel}
            {passagePanel}
            {studyPanel}
        </div>
    )
}