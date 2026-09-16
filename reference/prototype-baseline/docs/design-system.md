# UNLIM design system

Источник истины: `src/styles/*.css` для значений, `src/design-system/index.ts` для production API, `?view=ui-kit` для живых примеров. Не копируй шкалы из каталога в компоненты.

## Типографика

Используй `Typography` или ролевой CSS-класс:

- `micro` — вторичная служебная подпись;
- `caption` — label, badge, metadata;
- `ui` — текст контролов и короткие строки интерфейса;
- `body-small` — описание внутри карточки;
- `body` — основной текст;
- `editorial` — крупный вводный абзац; `hero-lead` — лид полноэкранного hero;
- `title-compact`, `title-dense`, `title-card`, `title-large` — разные плотности заголовка, не взаимозаменяемые по случайному размеру;
- `price` — цена или крупная метрика;
- `section`, `hero` — заголовки уровня страницы.

Размер, line-height, weight, tracking и responsive-шкала входят в роль. `body`, `body-small` и `ui` имеют основной weight интерфейса. Цвет ортогонален: передавай semantic `Typography tone`; на тёмной поверхности доступны inverse, inverse-strong, inverse-muted и inverse-subtle. Не добавляй локальный `text-[…]`, повторный tracking или weight, противоречащий роли.

Каждый `.type-*` имеет безопасный default color в base cascade: служебные роли серые, светлые content-роли ink, hero/hero-lead — фактические inverse defaults. Utilities и semantic tone сильнее base-default. Если элемент на тёмной поверхности не использует hero-default, назначай inverse tone или явный text utility — не полагайся на цвет родителя.

UI-kit отдельно показывает defaults всех ролей и production overrides для Court eyebrow, Court dense title и dark Price. Это не связывает tone с role: одна роль использует разные tones по поверхности. Каталог не назначает выдуманный brand accent роли; accent находится только в самостоятельной tone-matrix, пока реальный recipe явно его не запросит.

## Компоненты

- `Button` — действие в текущем интерфейсе; `ButtonLink` — навигация. Размер задаёт высоту. Не переопределяй её локально. `loading` блокирует повторное действие и выставляет busy-state. Primary автоматически получает shine; остальные variants — нет. Для редкой нативной lime-кнопки вне `Button` добавь `btn-shine` явно; предпочтительно всё же использовать `Button`.
- `IconButton` требует доступное имя через `aria-label` или видимый текст.
- `Field` связывает label, description и error уникальными id. Передавай бизнес-валидацию через `error`; native input props проходят без адаптеров.
- `Tabs` — одиночный выбор раздела. Контент активной вкладки оформляй как `tabpanel`. Стрелки, Home и End поддерживаются компонентом.
- `Accordion` — только для независимых раскрываемых ответов.
- `BottomSheet` — мобильный модальный паттерн; имя, Escape, focus trap, scroll lock и возврат фокуса уже входят в контракт.
- `Dialog` — адаптивный portal-modal. Используй для карточек с подробностями; Escape, focus trap, scroll lock и возврат фокуса входят в компонент.
- `Price` — вся повторяемая композиция label/value/old value/suffix. `compact` нужен для плотной строки, `standard` — для карточки тарифа.
- `Badge` сообщает статус или категорию. `glass` и исторически названный `outline-light` сохраняют фирменную стеклянную подложку: 10% белого + blur, без рамки. `outline-dark` — реальная обводка на светлом фоне. Художественные `sunset`, `gold`, `lime-soft` не собирай локальными классами.
- `SurfaceCard` — общее ядро. По умолчанию карточка сохраняет фирменный spring lift и pointer cursor; `interactive={false}` оставляет служебную поверхность неподвижной. Для доступного действия используй ссылку/кнопку поверх карточки либо готовый интерактивный recipe.
- `WhiteCard`, `MeshCard`, `GlassCard` — совместимые surface-варианты. `ImageCard` — отдельная full-bleed композиция с обязательным цветным overlay.
- `ArrowAction` — визуальный карточный affordance с motion, декоративный и скрытый от accessibility tree. Он не заменяет ссылку или кнопку; реальное действие должно оставаться `Button`, `ButtonLink` или семантикой всей карточки.

## Композиция

Карточка обычно состоит из badge/metadata, `CardTitle`, `CardBody`, затем footer с `Price` или настоящим control. Повторяй этот порядок прежде, чем вводить новый recipe-компонент. Новый компонент оправдан повторяемой логикой или контрактом, а не одним набором отступов.

Точные recipes находятся в `src/components/cards` и экспортируются через `src/design-system`. Секции только компонуют их; UI-kit импортирует компоненты только из public barrel и не зависит от `sections`. Для новой страницы сначала проверь готовый recipe в barrel, затем собирай его из UI-компонентов и CSS roles.

- `BenefitCards`: семь benefit recipes и `benefitCardComponents`. В mesh-вариантах eyebrow/state стоит слева, FeatureIcon — справа в общей header-row.
- `CourtCards`: panoramic, metrics, damping, surface и `courtCardComponents`.
- `GalleryCard`: spring/parallax gallery tile; горизонтальный ряд собирает `Gallery` через `Marquee`.
- Content/pricing: Article, Coach, Review, Tournament, Training, Rent, Membership, Offer. `CoachCard` содержит доступный профильный dialog.

Mesh, glass, image overlay и hero-эффекты — художественные поверхности. На обычной информационной карточке используй белую поверхность. Glow следует variant кнопки; lime-shadow нельзя переносить на neutral/dark/glass.

Parallax-изображение обязано иметь overscan больше полного вертикального travel. Не ставь `y` прямо на изображение высотой `100%`: отдельный overscan-layer должен оставаться за верхней и нижней границей viewport даже в крайних значениях скролла.

## Responsive и accessibility

- Проверяй узкую мобильную ширину, планшет и широкий desktop. Горизонтальный скролл разрешён только внутри явно скроллируемого контрола.
- Каждый горизонтальный Swiper использует `horizontalSwiperProps` и `swiper-breathe`: горизонтальный trackpad работает с `forceToAxis`, вертикальная прокрутка страницы освобождается, hover не режется viewport контейнера.
- Gallery Marquee сохраняет горизонтальный `overflow-hidden`, но использует `marquee-breathe` для вертикального spring-reserve. Не переноси clipping с рамки изображения на сам hover viewport.
- Интерактивный элемент должен иметь native-семантику, видимый `focus-visible`, доступное имя и disabled-state при недоступности.
- Не вкладывай кнопку в ссылку или ссылку в кнопку. Вся кликабельная карточка должна быть ссылкой; иначе действие размещается отдельным контролом.
- Не полагайся только на hover: основной смысл и действие видимы без него.
- Анимация учитывает `prefers-reduced-motion` через общий `MotionConfig` и CSS.
- `CoolModeEffects` монтируется один раз у корня и обслуживает native button и `ButtonLink`. Частицы рендерятся в `document.body` поверх overflow-контейнеров. Для системного действия без эффекта укажи `data-cool-mode="off"`; reduced motion отключает частицы.

## Do / don’t

Делай: импортируй из `src/design-system`, используй semantic color/type roles, передавай native props, добавляй новый tone централизованно.

Не делай: локальные half-pixel размеры, скрытые высоты контролов, div/span с обработчиком вместо button/link, parallax без overscan, копию production card markup в секции или каталоге, отдельные click-handlers для Cool Mode.
