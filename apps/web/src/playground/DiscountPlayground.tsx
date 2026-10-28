import { useState } from 'react'
import { ArrowUpRight, CalendarCheck, Check, ChevronRight, Gift, Home, Menu, Play, ShieldCheck, Smartphone, Monitor, Tag, UsersRound, Cookie, X } from 'lucide-react'
import './discount-playground.css'

const buttons = [
  { title: '01 · Талон', description: 'Рекомендую. Скидка видна сразу, но не спорит с бронированием.' },
  { title: '02 · Капсула', description: 'Тише, компактнее. Для тех, кому не нужен второй яркий акцент.' },
  { title: '03 · Боковой ярлык', description: 'Минимум перекрытия контента. Текст приходится читать боком.' },
]
const consents = [
  { title: 'A · Выбор над полями', description: 'Рекомендую. Решение видно до ввода; отказ и игнорирование не мешают заявке.' },
  { title: 'B · Отдельный шаг', description: 'Лучше собирает решение до ввода. Цена — дополнительный шаг перед формой.' },
  { title: 'C · Отдельная галочка', description: 'Привычно и компактно. Начало ввода до галочки останется без Метрики.' },
]
function DiscountButton({ variant, mobile, onClick }: { variant: number; mobile: boolean; onClick: () => void }) {
  return <button type="button" className={`discount-trigger variant-${variant} ${mobile ? 'mobile-trigger' : ''}`} onClick={onClick}>
    {mobile ? <><span>Сохранить скидку</span></> : variant === 0 ? <><span className="ticket-percent">50<span>%</span></span><span className="ticket-copy">Скидка на старт<small>Сохранить себе <ArrowUpRight size={12} /></small></span></> : variant === 1 ? <><span className="capsule-icon"><Gift size={20} /></span><span>Сохранить скидку<small>−50% на аренду</small></span><ArrowUpRight size={17} /></> : <><span>Сохранить скидку</span></>}
  </button>
}
export function DiscountPlayground() {
  const [variant, setVariant] = useState(2), [consentVariant, setConsentVariant] = useState(1)
  const [mobile, setMobile] = useState(false), [open, setOpen] = useState(false), [success, setSuccess] = useState(false)
  const [consent, setConsent] = useState<boolean | null>(null), [stepDone, setStepDone] = useState(false), [started, setStarted] = useState(false), [tracked, setTracked] = useState(false)
  const reset = () => { setConsent(null); setStepDone(false); setStarted(false); setTracked(false); setSuccess(false); setOpen(true) }
  const choose = (value: boolean) => { setConsent(value); setStepDone(true) }
  const consentCopy = <><strong><Cookie size={16} />Используем cookie и Яндекс Метрику</strong><p>Продолжая, вы соглашаетесь с <a href="/policy" target="_blank" rel="noreferrer"><u>политикой конфиденциальности</u></a>.</p></>
  return <div className="discount-lab">
    <div className="lab-heading"><div><span className="lab-kicker">UNLIM / INTERACTION LAB</span><h1>Скидка остаётся.<br /><span>Решение — за игроком.</span></h1></div><p>Локальный макет. Можно открыть форму, закрыть её и вернуться по кнопке. Заявки и события отсюда никуда не уходят.</p></div>
    <div className="lab-config"><div><span className="lab-label">Кнопка на компьютере</span><div className="lab-tabs">{buttons.map((item, i) => <button key={item.title} aria-pressed={variant === i} onClick={() => setVariant(i)}>{item.title}</button>)}</div><p>{buttons[variant].description}</p></div><div><span className="lab-label">Согласие внутри формы</span><div className="lab-tabs">{consents.map((item, i) => <button key={item.title} aria-pressed={consentVariant === i} onClick={() => { setConsentVariant(i); reset() }}>{item.title}</button>)}</div><p>{consents[consentVariant].description}</p></div></div>
    <div className="lab-toolbar"><div className="lab-tabs"><button aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor size={15} />Компьютер</button><button aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone size={15} />Телефон · 390px</button></div><button className="lab-reset" onClick={reset}>Открыть форму / сбросить демо <ChevronRight size={15} /></button></div>
    <div className={`lab-stage ${mobile ? 'phone' : 'desktop'}`}>
      <div className="lab-site-head"><div className="lab-brand"><img src="https://cms.unlimpadel.ru/api/media/file/logo-unlim.svg" alt="" /><div><img src="https://cms.unlimpadel.ru/api/media/file/unlimpadel-1.svg" alt="UNLIM PADEL" /><small>Новорижское шоссе 32км 3с2</small></div></div>{!mobile && <div className="lab-nav"><span>Цены</span><span>Тренировки</span><span>О клубе</span><button onClick={() => setOpen(true)}>Забронировать <CalendarCheck size={17} /></button></div>}</div>
      <div className="lab-hero"><span className="lab-eyebrow">БОЛЬШЕ ИГРЫ. МЕНЬШЕ ОТГОВОРОК.</span><h2>2 недели с открытия<br />аренда со скидкой <em>50%</em></h2><p>Премиальный крытый падел-клуб в Москве с испанскими панорамными кортами и клубным лаунжем.</p><div className="lab-hero-actions"><button onClick={() => setOpen(true)}>Забронировать <CalendarCheck size={20} /></button><span>Планируемая дата<small>открытия 8.11</small></span></div></div>
      <DiscountButton variant={variant} mobile={mobile} onClick={() => setOpen(true)} />
      {mobile && <div className="lab-bottom">{[[Home,'Главная'],[Tag,'Цены'],[Play,'Играть'],[UsersRound,'Тренеры'],[Menu,'Меню']].map(([Icon,label]) => { const Glyph = Icon as typeof Home; return <span key={String(label)} className={label === 'Играть' ? 'active' : ''}><Glyph size={20} /><small>{String(label)}</small></span> })}</div>}
      {open && <div className="lab-overlay" onClick={() => setOpen(false)}><section className="lab-sheet" aria-label="Демонстрация листа ожидания" onClick={e => e.stopPropagation()}><button className="lab-close" aria-label="Закрыть форму" onClick={() => setOpen(false)}><X size={18} /></button>
        {success ? <div className="lab-success"><span><Check size={27} /></span><h3>Вы в листе ожидания</h3><p>Демо: скидка сохранена.<br />Реальная заявка не отправлялась.</p><button className="lab-submit" onClick={() => setOpen(false)}>Готово</button></div> : <><h3>Лист ожидания открыт</h3><p className="lab-sheet-intro">Оставьте контакты.<br />Сохраним скидку 50% и сообщим об открытии.</p>
        {consentVariant === 1 && !stepDone ? <div className="lab-consent-step">{consentCopy}<button className="lab-submit" onClick={() => choose(true)}>Продолжить</button><button className="lab-without" onClick={() => setOpen(false)}>Я передумал</button><small></small></div> : <>
          {consentVariant === 0 && <div className="lab-consent-card">{consentCopy}<div><button className={consent === true ? 'selected' : ''} aria-pressed={consent === true} onClick={() => choose(true)}>{consent === true && <Check size={13} />}Окей</button><button className={consent === false ? 'selected' : ''} aria-pressed={consent === false} onClick={() => choose(false)}>Без аналитики</button></div></div>}
          {consentVariant === 2 && <label className="lab-check lab-analytics-check"><input type="checkbox" checked={consent === true} onChange={e => setConsent(e.target.checked)} /><span>Используем cookie и Яндекс Метрику. Продолжая, вы соглашаетесь с политикой конфиденциальности.</span></label>}
          {consentVariant === 1 && <div className="lab-consent-status"><ShieldCheck size={15} />{consent ? 'Яндекс Метрика разрешена' : 'Продолжаем без аналитики'}<button onClick={() => setStepDone(false)}>Изменить</button></div>}
          <form onSubmit={e => { e.preventDefault(); setSuccess(true) }}><input aria-label="Имя" placeholder="Имя" minLength={2} required onInput={e => { if (e.currentTarget.value.trim() && !started) { setStarted(true); setTracked(consent === true) } }} /><input aria-label="Телефон" type="tel" placeholder="Телефон" required onInput={e => { if (e.currentTarget.value.trim() && !started) { setStarted(true); setTracked(consent === true) } }} /><label className="lab-check"><input type="checkbox" required /><span>Согласие на обработку персональных данных для заявки · <u>подробнее</u></span></label><button className="lab-submit">Сохранить скидку</button></form><div className="lab-chat"><span>↗</span><div>Открытый чат в Telegram<small>Общение, поиск игроков, новости</small></div><ArrowUpRight size={17} /></div>
        </>}</>}
      </section></div>}
    </div>
    <div className="lab-readout"><span className={consent ? 'on' : ''}>● Метрика: {consent ? 'разрешена (имитация)' : consent === false ? 'отказ' : 'решения нет'}</span><span>Начало ввода: {started ? 'да' : 'ещё нет'}</span><span>Цель начала: {tracked ? 'зафиксирована в демо' : 'не отправлена'}</span></div>
    <p className="lab-footnote">Обработка заявки и аналитика — разные цели. Если выбор проигнорирован, форма работает, Метрика остаётся выключенной. Позднее согласие не восстанавливает уже прошедший ввод.</p>
  </div>
}
