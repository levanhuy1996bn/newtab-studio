import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Focus, FolderOpen, Globe2, Heart, Image, LayoutGrid, Monitor, PanelsTopLeft, Search, Settings2, SlidersHorizontal, Sparkle, Sparkles, SquarePlus, Type, X } from 'lucide-react'
import { t, resultCount } from './i18n.js'
import { connectPreferences, usePreferences } from './preferences.js'
import { categories, defaultThemeId, filterThemes, galleryCategories, localized, themesById } from './themeCatalog.js'
import { Clock, ThemeScene } from './ThemeScene.jsx'
import { BackgroundStudio } from './BackgroundStudio.jsx'
import { TextEditor } from './TextEditor.jsx'
import { VisualEditor } from './VisualEditor.jsx'
import { readThemeDesign } from './studioRepository.js'
import { WidgetFlow } from './Widgets.jsx'
import { orderedWidgets } from './widgetLayouts.js'
import { hasClockWidget } from './widgetModel.js'
import { EffectsStudio } from './EffectsStudio.jsx'
import { motionAttributes, useMotionPreference } from './SceneEffects.jsx'
import { TabWidgetEditor } from './TabWidgetEditor.jsx'
import { CreatorProjects } from './CreatorProjects.jsx'
import { defaultQuoteId } from './studioData.js'
import { useThemeLibrary } from './useThemeLibrary.js'

const MyThemes = lazy(() => import('./MyThemes.jsx').then((module) => ({ default: module.MyThemes })))
const StudioSettings = lazy(() => import('./MyThemes.jsx').then((module) => ({ default: module.StudioSettings })))

function Header({ page, setPage, language, setLanguage, ready }) {
  return (
    <header className="site-header">
      <div className="site-header-inner mx-auto flex items-center justify-between gap-3">
        <button className="brand" onClick={() => setPage('tab')}>
          <img className="brand-mark" src="./icons/icon-128.png" alt="" width="38" height="38" />
          <span>Mango New Tab <strong>Studio</strong></span>
        </button>
        <nav className="navigation flex items-center gap-1" aria-label={t('navigation', language)}>
          <button aria-current={page === 'tab' ? 'page' : undefined} onClick={() => setPage('tab')}>
            <Monitor size={16} aria-hidden="true" /> {t('tab', language)}
          </button>
          <button aria-current={page === 'gallery' ? 'page' : undefined} onClick={() => setPage('gallery')}>
            <LayoutGrid size={16} aria-hidden="true" /> {t('gallery', language)}
          </button>
          <button aria-current={page === 'themes' ? 'page' : undefined} onClick={() => setPage('themes')}>
            <FolderOpen size={16} aria-hidden="true" /> {t('phaseThemes', language)}
          </button>
          <button aria-current={page === 'settings' ? 'page' : undefined} onClick={() => setPage('settings')}>
            <Settings2 size={16} aria-hidden="true" /> {t('phaseSettings', language)}
          </button>
          <button aria-current={page === 'studio' ? 'page' : undefined} onClick={() => setPage('studio')}>
            <Image size={16} aria-hidden="true" /> {t('studio', language)}
          </button>
          <button aria-current={page === 'text' ? 'page' : undefined} onClick={() => setPage('text')}>
            <Type size={16} aria-hidden="true" /> {t('textEditor', language)}
          </button>
          <button aria-current={page === 'canvas' ? 'page' : undefined} onClick={() => setPage('canvas')}>
            <PanelsTopLeft size={16} aria-hidden="true" /> {t('visualEditor', language)}
          </button>
        </nav>
        <button className="language" aria-label={t('changeLanguage', language)} disabled={!ready}
          onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}>
          <Globe2 size={17} aria-hidden="true" /> {language.toUpperCase()}
        </button>
      </div>
    </header>
  )
}

function ThemeCard({ theme, active, favorite, onFavorite, onPreview, language }) {
  const name = localized(theme.names, language)
  return (
    <article className="theme-card">
      <button className="card-open" aria-label={`${t('preview', language)} · ${name}`} onClick={onPreview}>
        <ThemeScene theme={theme} overrides={active?.overrides} background={active?.background}
          className="card-scene" still>
          <span className="card-preview-action">{t('preview', language)} <ArrowRight size={14} aria-hidden="true" /></span>
        </ThemeScene>
        <span className="card-meta">
          <span className="card-title">{name}</span>
          <span className="card-category">{localized(categories[theme.category], language)}</span>
        </span>
      </button>
      <button className="favorite-button icon-button" aria-label={`${t('favorite', language)} · ${name}`}
        aria-pressed={favorite} onClick={onFavorite}>
        <Heart size={17} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
      {active && <span className="active-badge"><Check size={13} aria-hidden="true" /> {t('applied', language)}</span>}
    </article>
  )
}

function ThemePreview({ theme, active, language, motion, scheduled, tabSelection, onClose, onApply, onApplied, onEdit, error }) {
  const dialog = useRef(null)
  const name = localized(theme.names, language)
  const initial = active.themeId === theme.id ? active.overrides : theme.overrides
  const [base, setBase] = useState(initial?.base ?? theme.colors[0])
  const [accent, setAccent] = useState(initial?.accent ?? theme.colors[2])
  const [saving, setSaving] = useState(false)
  const [savedDesign, setSavedDesign] = useState(null)
  const isActive = theme.id === active.themeId
  const previewDesign = isActive ? active : savedDesign
  const autoArrange = previewDesign?.canvas?.widgetLayout?.mode === 'auto'
  const background = isActive ? active.background : savedDesign?.background
  const custom = base !== theme.colors[0] || accent !== theme.colors[2]
  const alreadyApplied = (!scheduled || tabSelection?.themeId === theme.id) && theme.id === active.themeId
    && base === (active.overrides?.base ?? theme.colors[0])
    && accent === (active.overrides?.accent ?? theme.colors[2])

  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])

  useEffect(() => {
    if (isActive) return
    let alive = true
    readThemeDesign(theme.id).then((design) => {
      if (alive) setSavedDesign(design)
    }).catch(() => {
      // Keep the preset preview usable when the saved design cannot be loaded.
    })
    return () => { alive = false }
  }, [theme.id, isActive])

  async function apply() {
    setSaving(true)
    if (await onApply(theme.id, custom ? { base, accent } : null, { keepBackground: true })) {
      onClose()
      onApplied()
    } else setSaving(false)
  }

  return (
    <dialog ref={dialog} className="theme-dialog" aria-labelledby="preview-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}>
      <div className="dialog-heading">
        <div>
          <span className="card-category">{localized(categories[theme.category], language)}</span>
          <h2 id="preview-title">{name}</h2>
        </div>
        <button className="icon-button close-button" aria-label={t('close', language)} onClick={onClose}>
          <X size={21} aria-hidden="true" />
        </button>
      </div>
      <div {...motionAttributes(previewDesign?.effects, motion)}>
        <ThemeScene theme={theme} overrides={custom ? { base, accent } : null} background={background}
          textLayers={previewDesign?.textLayers} canvas={previewDesign?.canvas} dockWidgets={autoArrange}
          effects={previewDesign?.effects} motion={motion} language={language} className="dialog-scene">
          <Clock language={language} />
        </ThemeScene>
        {autoArrange && <WidgetFlow layers={orderedWidgets(previewDesign.canvas).filter((layer) => !layer.hidden)} language={language} />}
      </div>
      <fieldset className="customization" disabled={saving}>
        <legend>{t('customize', language)}</legend>
        <div className="color-options">
          <label>{t('base', language)} <input type="color" value={base} onChange={(event) => setBase(event.target.value)} /></label>
          <label>{t('accent', language)} <input type="color" value={accent} onChange={(event) => setAccent(event.target.value)} /></label>
          <button className="text-button" disabled={!custom} onClick={() => { setBase(theme.colors[0]); setAccent(theme.colors[2]) }}>
            {t('reset', language)}
          </button>
        </div>
      </fieldset>
      {error && <p className="error-message" role="alert">{t(error, language)}</p>}
      <div className="dialog-footer">
        <button className="secondary-button" disabled={saving} onClick={() => onEdit(theme.id, 'studio')}>
          <Image size={16} aria-hidden="true" /> {t('studio', language)}
        </button>
        <button className="secondary-button" disabled={saving} onClick={() => onEdit(theme.id, 'text')}>
          <Type size={16} aria-hidden="true" /> {t('textEditor', language)}
        </button>
        <button className="secondary-button" disabled={saving} onClick={() => onEdit(theme.id, 'canvas')}>
          <PanelsTopLeft size={16} aria-hidden="true" /> {t('visualEditor', language)}
        </button>
        <button className="secondary-button" disabled={saving} onClick={() => onEdit(theme.id, 'effects')}>
          <Sparkles size={16} aria-hidden="true" /> {t('effectTitle', language)}
        </button>
        <button className="primary-button" disabled={saving || alreadyApplied} onClick={apply}>
          <Check size={17} aria-hidden="true" /> {t(alreadyApplied ? 'applied' : scheduled ? 'scheduleApplySession' : 'apply', language)}
        </button>
      </div>
    </dialog>
  )
}

function Gallery({ active, favorites, language, openPreview, toggleFavorite }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const results = filterThemes({ query, category, favorites, favoritesOnly })

  function clearFilters() {
    setQuery('')
    setCategory('all')
    setFavoritesOnly(false)
  }

  return (
    <main id="main" tabIndex={-1} className="gallery content-width">
      <div className="gallery-heading">
        <div>
          <h1>{t('gallery', language)}</h1>
          <p>{t('galleryDescription', language)}</p>
        </div>
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder={t('searchPlaceholder', language)} aria-label={t('search', language)} />
        </label>
      </div>
      <div className="gallery-toolbar">
        <div className="filters flex flex-wrap items-center gap-2" role="group" aria-label={t('filters', language)}>
          <button className="chip" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
            {t('all', language)}
          </button>
          {galleryCategories.map(([id, names]) => (
            <button className="chip" key={id} aria-pressed={category === id} onClick={() => setCategory(id)}>
              {localized(names, language)}
            </button>
          ))}
        </div>
        <button className="chip favorite-filter" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(!favoritesOnly)}>
          <Heart size={16} fill={favoritesOnly ? 'currentColor' : 'none'} aria-hidden="true" /> {t('favorites', language)}
        </button>
      </div>
      <p className="results-count" role="status">{resultCount(results.length, language)}</p>
      {results.length > 0
        ? <div className="theme-grid grid gap-5">
          {results.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} language={language}
              active={active.themeId === theme.id ? active : null}
              favorite={favorites.has(theme.id)} onFavorite={() => toggleFavorite(theme.id)}
              onPreview={() => openPreview(theme)} />
          ))}
        </div>
        : <div className="empty-state">
          <Search size={24} aria-hidden="true" />
          <p>{t('empty', language)}</p>
          <button className="secondary-button" onClick={clearFilters}>{t('clear', language)}</button>
        </div>}
    </main>
  )
}

function TabRail({ language, focusMode, onFocus, showResume, onResume, onCustomize, onNavigate, onLanguage,
  widgetEditing, onToggleWidgets, widgetButton }) {
  const menu = useRef(null)
  const tools = [
    ['studio', Image, 'studio'], ['text', Type, 'textEditor'],
    ['canvas', PanelsTopLeft, 'visualEditor'], ['effects', Sparkles, 'effectTitle'],
    ['themes', FolderOpen, 'phaseThemes'], ['settings', Settings2, 'phaseSettings'],
  ]
  useEffect(() => {
    function closeOutside(event) {
      if (menu.current?.open && !menu.current.contains(event.target)) menu.current.open = false
    }
    function closeOnEscape(event) {
      if (event.key !== 'Escape' || !menu.current?.open) return
      menu.current.open = false
      menu.current.querySelector('summary').focus()
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])
  function run(action) {
    menu.current.open = false
    menu.current.querySelector('summary').focus()
    action()
  }
  return <nav className="tab-rail" aria-label={t('navigation', language)}>
    {!focusMode && <>
      <button type="button" className="tab-rail-button" aria-label={t('gallery', language)} title={t('gallery', language)}
        onClick={() => onNavigate('gallery')}><LayoutGrid size={20} aria-hidden="true" /></button>
      <button type="button" className="tab-rail-button" aria-label={t('widgetEditTab', language)} title={t('widgetEditTab', language)}
        aria-expanded={widgetEditing} aria-controls={widgetEditing ? 'tab-widget-editor' : undefined}
        ref={widgetButton} onClick={onToggleWidgets}><SquarePlus size={20} aria-hidden="true" /></button>
      <details ref={menu}>
      <summary className="tab-rail-button" aria-label={t('customize', language)} title={t('customize', language)}>
        <SlidersHorizontal size={20} aria-hidden="true" />
      </summary>
      <div className="tab-customize">
        <button type="button" onClick={() => run(onCustomize)}><Sparkle size={17} aria-hidden="true" /> {t('customize', language)}</button>
        {tools.map(([route, Icon, label]) => <button type="button" key={route}
          onClick={() => run(() => onNavigate(route))}><Icon size={17} aria-hidden="true" /> {t(label, language)}</button>)}
        {showResume && <button type="button" onClick={() => run(onResume)}>{t('scheduleResume', language)}</button>}
        <button type="button" onClick={onLanguage}><Globe2 size={17} aria-hidden="true" /> {language === 'vi' ? 'English' : 'Tiếng Việt'}</button>
      </div>
      </details>
    </>}
    <button type="button" className="tab-rail-button" aria-pressed={focusMode}
      aria-label={t(focusMode ? 'focusExit' : 'focusMode', language)} title={t(focusMode ? 'focusExit' : 'focusMode', language)}
      onClick={onFocus}><Focus size={20} aria-hidden="true" /></button>
  </nav>
}

function TabWidgetPages({ widgets, language, width, height, compact }) {
  const [page, setPage] = useState(0)
  const defaultQuoteOnly = widgets.length === 1 && widgets[0].id === defaultQuoteId
  const columns = defaultQuoteOnly ? 1 : Math.max(1, Math.min(4, Math.floor((Math.min(width - 76, 920) + 10) / 220)))
  const perPage = columns * (height < 620 ? 1 : 2)
  const total = Math.ceil(widgets.length / perPage)
  const current = Math.min(page, total - 1)
  const visible = widgets.slice(current * perPage, (current + 1) * perPage)
  return <div className={defaultQuoteOnly ? 'tab-widget-pages tab-widget-pages-default-quote' : 'tab-widget-pages'}
    style={{ '--widget-columns': columns }}>
    <WidgetFlow layers={widgets} visibleIds={new Set(visible.map(({ id }) => id))} language={language} live
      className={compact ? 'tab-widget-flow widget-dock' : 'tab-widget-flow'} />
    {total > 1 && <div className="widget-pager" role="group" aria-label={t('widgetPage', language)}>
      <button type="button" className="tab-rail-button" disabled={current === 0}
        aria-label={t('previousWidgets', language)} onClick={() => setPage(current - 1)}><ChevronLeft size={18} aria-hidden="true" /></button>
      <span aria-live="polite">{current + 1} / {total}</span>
      <button type="button" className="tab-rail-button" disabled={current === total - 1}
        aria-label={t('nextWidgets', language)} onClick={() => setPage(current + 1)}><ChevronRight size={18} aria-hidden="true" /></button>
    </div>}
  </div>
}

function NewTab({ theme, active, language, motion, focusMode, canvas = active.canvas, canvasEditor, widgetTools }) {
  const readViewport = () => ({ width: window.innerWidth, height: window.innerHeight })
  const [{ width, height }, setViewport] = useState(readViewport)
  useEffect(() => {
    const resize = () => setViewport(readViewport())
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  const compact = width <= 720
  const autoArrange = canvas?.widgetLayout?.mode === 'auto'
  const widgets = (autoArrange ? orderedWidgets(canvas)
    : canvas?.layers.filter((layer) => layer.type === 'widget') ?? []).filter((layer) => !layer.hidden)
  const dockWidgets = !canvasEditor && (autoArrange || compact)
  const flow = dockWidgets && widgets.length > 0
  const hasSceneContent = !hasClockWidget(canvas) || active.textLayers?.some((layer) => layer.mode === 'daily' || layer.text.trim())
    || canvas?.layers.some((layer) => layer.type !== 'widget' && !layer.hidden)
  return (
    <main id="main" tabIndex={-1} className="new-tab" {...motionAttributes(active.effects, motion)}>
      {widgetTools}
      <ThemeScene theme={theme} overrides={active.overrides} background={active.background}
        textLayers={active.textLayers} canvas={canvas} canvasEditor={canvasEditor} effects={active.effects} motion={motion} language={language}
        className={flow ? `tab-scene tab-scene-flow${hasSceneContent ? '' : ' tab-scene-empty'}` : 'tab-scene'}
        liveWidgets={!canvasEditor} dockWidgets={dockWidgets}>
        <Clock language={language} />
      </ThemeScene>
      {flow && <TabWidgetPages key={theme.id} {...{ widgets, language, width, height, compact }} />}
      {!focusMode && <div className="tab-bottom-bar">
        {!canvasEditor && <CreatorProjects />}
        <div className="tab-caption"><h1>{localized(theme.names, language)}</h1></div>
      </div>}
    </main>
  )
}

export function App() {
  const preferences = usePreferences()
  const { ready, language, active, favorites, error, setLanguage, toggleFavorite, applyTheme,
    focusMode, performanceMode, setFocusMode, tabSelection, schedule, resumeSchedule, restoreEpoch } = preferences
  const library = useThemeLibrary()
  const motion = useMotionPreference(performanceMode)
  const [page, setPage] = useState('tab')
  const [preview, setPreview] = useState(null)
  const [editorThemeId, setEditorThemeId] = useState(null)
  const [widgetThemeId, setWidgetThemeId] = useState(null)
  const widgetButton = useRef(null)
  const findTheme = (id) => themesById.get(id) ?? library.custom.find((theme) => theme.id === id)
  const activeTheme = findTheme(active.themeId) ?? themesById.get(defaultThemeId)
  const editorTheme = findTheme(editorThemeId) ?? activeTheme
  const editorActive = editorTheme.id === active.themeId ? active : null
  const editorKey = editorTheme.id + ':' + restoreEpoch

  useEffect(connectPreferences, [])
  useEffect(() => { document.documentElement.lang = language }, [language])
  useEffect(() => {
    if (!restoreEpoch) return
    setPreview(null)
    setWidgetThemeId(null)
    setEditorThemeId(null)
    setPage((current) => ['studio', 'text', 'canvas', 'effects'].includes(current) ? 'tab' : current)
  }, [restoreEpoch])

  function navigate(next) {
    if (next === page) return
    setWidgetThemeId(null)
    setEditorThemeId(['studio', 'text', 'canvas', 'effects'].includes(next) ? editorTheme.id : null)
    setPage(next)
    window.scrollTo(0, 0)
  }

  function openEditor(id, editor) {
    setPreview(null)
    setEditorThemeId(id)
    setPage(editor)
    window.scrollTo(0, 0)
  }

  const isTab = page === 'tab' && ready
  const widgetEditing = isTab && !focusMode && widgetThemeId === activeTheme.id
  useEffect(() => {
    if (widgetThemeId && widgetThemeId !== activeTheme.id) setWidgetThemeId(null)
  }, [widgetThemeId, activeTheme.id])

  function closeWidgets() {
    setWidgetThemeId(null)
    widgetButton.current?.focus()
  }

  const tabProps = { theme: activeTheme, active, language, motion, focusMode }
  return (
    <div className={isTab ? (focusMode ? 'immersive-tab focus-tab' : 'immersive-tab') : undefined}
      data-performance={isTab && performanceMode || undefined}>
      <a className="skip-link" href="#main">{t('skip', language)}</a>
      {isTab ? <TabRail language={language} focusMode={focusMode} onFocus={() => {
        setWidgetThemeId(null)
        setFocusMode(!focusMode)
      }} widgetEditing={widgetEditing} widgetButton={widgetButton}
        onToggleWidgets={() => widgetEditing ? closeWidgets() : setWidgetThemeId(activeTheme.id)}
        showResume={Boolean(tabSelection && schedule.mode !== 'off')} onResume={resumeSchedule} onNavigate={navigate}
        onCustomize={() => { setWidgetThemeId(null); setPreview(activeTheme) }} onLanguage={() => setLanguage(language === 'en' ? 'vi' : 'en')} />
        : <Header page={page} setPage={navigate} language={language} setLanguage={setLanguage} ready={ready} />}
      {error && !preview && (page === 'tab' || page === 'gallery')
        && <p className="error-banner error-message content-width" role="alert">{t(error, language)}</p>}
      <Suspense fallback={<main id="main" className="content-width loading" role="status">{t('loading', language)}</main>}>
      {!ready
        ? <main id="main" tabIndex={-1} className="content-width loading" role="status">{t('loading', language)}</main>
        : page === 'tab'
          ? widgetEditing
            ? <TabWidgetEditor key={widgetThemeId} {...{ active, language }} onApply={applyTheme} onClose={closeWidgets}>
              {(canvas, canvasEditor, widgetTools) => <NewTab {...tabProps} {...{ canvas, canvasEditor, widgetTools }} />}
            </TabWidgetEditor>
            : <NewTab key={restoreEpoch} {...tabProps} />
          : page === 'themes' ? <MyThemes {...{ activeTheme, active, library, language, applyTheme, navigate }}
            onPreview={setPreview} onEditor={openEditor} />
          : page === 'settings' ? <StudioSettings preferences={preferences} />
          : page === 'studio'
            ? <BackgroundStudio key={editorKey} theme={editorTheme}
              overrides={editorActive?.overrides ?? editorTheme.overrides ?? null} language={language}
              onApply={applyTheme} onApplied={() => navigate('tab')} error={error} />
            : page === 'text'
              ? <TextEditor key={editorKey} theme={editorTheme} current={editorActive} language={language}
                onApply={applyTheme} onApplied={() => navigate('tab')} error={error} />
              : page === 'canvas'
                ? <VisualEditor key={editorKey} theme={editorTheme} current={editorActive} language={language}
                  onApply={applyTheme} onApplied={() => navigate('tab')} error={error} />
                : page === 'effects'
                  ? <EffectsStudio key={editorKey} theme={editorTheme} current={editorActive} motion={motion} language={language}
                    onApply={applyTheme} onApplied={() => navigate('tab')} preferences={preferences} customThemes={library.custom} />
                  : <Gallery active={active} favorites={favorites} language={language}
                    openPreview={setPreview} toggleFavorite={toggleFavorite} />}
      </Suspense>
      {preview && <ThemePreview key={preview.id} theme={preview} active={active} language={language} motion={motion}
        scheduled={schedule.mode !== 'off'} tabSelection={tabSelection}
        onClose={() => setPreview(null)} onApply={applyTheme} onApplied={() => navigate('tab')}
        onEdit={openEditor} error={error} />}
    </div>
  )
}
