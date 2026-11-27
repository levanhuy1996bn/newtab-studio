import { useRef } from 'react'
import { ArrowUpRight, Code, GraduationCap, X } from 'lucide-react'

const projects = [
  { title: 'Developer Toolkit', icon: Code,
    url: 'https://chromewebstore.google.com/detail/gnddlndbhfbojfgjjgifagahocfahhce' },
  { title: '3D Football Manager', url: 'https://huydicode-football.vercel.app/' },
  { title: 'Learning Games for Kids', icon: GraduationCap,
    url: 'https://xoaidihoc.vercel.app/' },
]

export function CreatorProjects() {
  const dialog = useRef(null)
  return (
    <>
      <button type="button" className="creator-projects-button" lang="en" aria-haspopup="dialog"
        aria-controls="creator-projects" onClick={() => dialog.current.showModal()}>
        More by the Creator <ArrowUpRight size={13} aria-hidden="true" />
      </button>
      <dialog id="creator-projects" ref={dialog} className="creator-projects" lang="en" aria-label="More by the Creator"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current.close() }}>
        <div className="creator-projects-content">
          <header>
            <h2>Poetry</h2>
            <button type="button" aria-label="Close" onClick={() => dialog.current.close()}>
              <X size={17} aria-hidden="true" />
            </button>
          </header>
          <a className="creator-poetry-link" href="https://trello.com/b/ZyUMRCdT/share-ups-and-downs"
            target="_blank" rel="noopener noreferrer">
            <strong>Share Ups and Downs</strong>
            <span>Read my poems <ArrowUpRight size={15} aria-hidden="true" /></span>
          </a>
          <h2 className="creator-projects-label">Projects</h2>
          <ul>
            {projects.map(({ title, icon: Icon, url }) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <span className="creator-projects-icon" aria-hidden="true">{Icon ? <Icon size={17} /> : '⚽'}</span>
                  <strong>{title}</strong>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  )
}
