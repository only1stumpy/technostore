const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.author = 'Степанов Евгений Владиславович';
pptx.company = 'ПГУ им. Т.Г. Шевченко';
pptx.subject = 'Дипломная презентация';
pptx.title = 'Разработка веб-приложения интернет-магазина электроники TechnoStore';
pptx.lang = 'ru-RU';
pptx.theme = {
  headFontFace: 'Times New Roman',
  bodyFontFace: 'Times New Roman',
  lang: 'ru-RU'
};
pptx.layout = 'LAYOUT_WIDE';
pptx.margin = 0;

const W = 13.333;
const H = 7.5;
const TOTAL = 13;
const C = {
  white: 'FFFFFF',
  ink: '111111',
  muted: '4B5563',
  red: 'B91C1C',
  redDark: '7F1D1D',
  redLight: 'FEE2E2',
  amber: 'F59E0B',
  amberLight: 'FEF3C7',
  blue: '2563EB',
  blueLight: 'DBEAFE',
  green: '15803D',
  greenLight: 'DCFCE7',
  gray: 'E5E7EB',
  soft: 'F8FAFC',
  panel: 'F6F7FB'
};

let num = 0;
const nextNum = () => ++num;
const shadow = () => ({ type: 'outer', color: '000000', opacity: 0.08, blur: 2, offset: 1, angle: 45 });

function addBackground(slide, mode = 'light') {
  slide.background = { color: C.white };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: mode === 'title' ? 'FAFAFC' : C.white }, line: { color: mode === 'title' ? 'FAFAFC' : C.white } });
  slide.addShape(pptx.ShapeType.arc, { x: 10.9, y: -0.65, w: 2.9, h: 2.9, adjustPoint: 0.18, fill: { color: C.redLight, transparency: 12 }, line: { color: C.redLight, transparency: 100 } });
  slide.addShape(pptx.ShapeType.arc, { x: -1.05, y: 5.7, w: 2.65, h: 2.65, adjustPoint: 0.22, fill: { color: C.blueLight, transparency: 15 }, line: { color: C.blueLight, transparency: 100 } });
  slide.addShape(pptx.ShapeType.chevron, { x: 11.55, y: 5.75, w: 0.8, h: 0.75, rotate: 28, fill: { color: C.red, transparency: 82 }, line: { color: C.red, transparency: 100 } });
  slide.addShape(pptx.ShapeType.rect, { x: 0.18, y: 0.18, w: 0.08, h: 6.85, fill: { color: C.redDark, transparency: mode === 'title' ? 18 : 35 }, line: { color: C.redDark, transparency: 100 } });
  slide.addShape(pptx.ShapeType.rect, { x: 0.32, y: 0.18, w: 0.04, h: 6.85, fill: { color: C.blue, transparency: 50 }, line: { color: C.blue, transparency: 100 } });
}

function addFooter(slide, n) {
  slide.addShape(pptx.ShapeType.line, { x: 0.65, y: 6.96, w: 11.55, h: 0, line: { color: C.gray, width: 0.9 } });
  slide.addText(`${n} / ${TOTAL}`, { x: 10.7, y: 7.03, w: 1.55, h: 0.34, fontFace: 'Times New Roman', fontSize: 19, bold: true, color: C.ink, align: 'right', margin: 0 });
}

function addHeader(slide, title, n) {
  addBackground(slide);
  slide.addText(title, { x: 0.7, y: 0.4, w: 11.0, h: 0.45, fontFace: 'Times New Roman', fontSize: 26, bold: true, color: C.ink, margin: 0 });
  addFooter(slide, n);
}

function card(slide, x, y, w, h, fill = C.white, line = C.gray) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: line, width: 1 }, shadow: shadow() });
}

function bulletList(slide, items, x, y, w, h, size = 20) {
  slide.addText(items.map((text, i) => ({ text, options: { bullet: true, breakLine: i < items.length - 1 } })), {
    x, y, w, h,
    fontFace: 'Times New Roman',
    fontSize: size,
    color: C.ink,
    fit: 'shrink',
    margin: 0.04,
    paraSpaceAfterPt: 8,
    bullet: { indent: 16 }
  });
}

function placeholder(slide, x, y, w, h, label, detail) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.redDark, width: 1.1 }, shadow: shadow() });
  slide.addShape(pptx.ShapeType.rect, { x: x + 0.18, y: y + 0.18, w: w - 0.36, h: h - 0.36, fill: { color: C.soft }, line: { color: 'CBD5E1', width: 1.1, dash: 'dash' } });
  slide.addShape(pptx.ShapeType.line, { x: x + 0.45, y: y + 0.45, w: w - 0.9, h: h - 0.9, line: { color: 'CBD5E1', width: 1 } });
  slide.addShape(pptx.ShapeType.line, { x: x + w - 0.45, y: y + 0.45, w: -w + 0.9, h: h - 0.9, line: { color: 'CBD5E1', width: 1 } });
  slide.addShape(pptx.ShapeType.roundRect, { x: x + 0.58, y: y + 0.55, w: 1.4, h: 0.36, rectRadius: 0.04, fill: { color: C.redLight }, line: { color: C.redLight } });
  slide.addText('Скриншот', { x: x + 0.72, y: y + 0.66, w: 1.12, h: 0.12, fontFace: 'Times New Roman', fontSize: 12.5, bold: true, color: C.redDark, align: 'center', margin: 0 });
  slide.addText(label, { x: x + 0.55, y: y + h / 2 - 0.35, w: w - 1.1, h: 0.34, fontFace: 'Times New Roman', fontSize: 21, bold: true, color: C.ink, align: 'center', fit: 'shrink', margin: 0 });
  slide.addText(detail, { x: x + 0.75, y: y + h / 2 + 0.1, w: w - 1.5, h: 0.44, fontFace: 'Times New Roman', fontSize: 14.5, color: C.muted, align: 'center', fit: 'shrink', margin: 0 });
}

function stat(slide, value, label, x, y, color) {
  card(slide, x, y, 3.25, 1.2, C.white, color);
  slide.addText(value, { x: x + 0.15, y: y + 0.2, w: 2.95, h: 0.35, fontFace: 'Times New Roman', fontSize: 28, bold: true, color, align: 'center', margin: 0 });
  slide.addText(label, { x: x + 0.25, y: y + 0.68, w: 2.75, h: 0.28, fontFace: 'Times New Roman', fontSize: 15, color: C.ink, align: 'center', fit: 'shrink', margin: 0 });
}

{
  const n = nextNum();
  const slide = pptx.addSlide();
  addBackground(slide, 'title');
  slide.addText('Приднестровский государственный университет им. Т.Г. Шевченко\nФизико-технический институт\nФакультет информатики и вычислительной техники\nКафедра информационных технологий', {
    x: 1.05, y: 0.42, w: 11.2, h: 0.9, fontFace: 'Times New Roman', fontSize: 14, color: C.ink, align: 'center', fit: 'shrink', margin: 0
  });
  slide.addText('Тема: «Разработка веб-приложения\nинтернет-магазина электроники\nTechnoStore»', {
    x: 1.55, y: 2.3, w: 10.25, h: 1.05, fontFace: 'Times New Roman', fontSize: 23.5, bold: true, color: C.ink, align: 'center', fit: 'shrink', margin: 0
  });
  slide.addShape(pptx.ShapeType.roundRect, { x: 1.3, y: 4.45, w: 10.75, h: 1.35, rectRadius: 0.06, fill: { color: C.panel }, line: { color: C.panel } });
  slide.addText('Работу выполнил студент группы ИТ22ДР62ИС\nСтепанов Евгений Владиславович', { x: 1.75, y: 4.72, w: 4.8, h: 0.48, fontFace: 'Times New Roman', fontSize: 15.5, color: C.ink, fit: 'shrink', margin: 0 });
  slide.addText('Руководитель,\nк.т.н., преподаватель\nЗинченко Сергей Владиславович', { x: 7.05, y: 4.66, w: 4.55, h: 0.62, fontFace: 'Times New Roman', fontSize: 15.5, color: C.ink, fit: 'shrink', margin: 0 });
  addFooter(slide, n);
}

{
  const n = nextNum();
  const slide = pptx.addSlide();
  addHeader(slide, 'Цель и задачи работы', n);
  card(slide, 0.9, 1.25, 11.55, 1.3, C.redLight, C.red);
  slide.addText('Цель работы', { x: 1.25, y: 1.48, w: 2.1, h: 0.3, fontFace: 'Times New Roman', fontSize: 21, bold: true, color: C.redDark, margin: 0 });
  slide.addText('разработать веб-приложение интернет-магазина электроники TechnoStore для выбора товаров, оформления заказов и управления магазином.', {
    x: 3.55, y: 1.43, w: 8.4, h: 0.48, fontFace: 'Times New Roman', fontSize: 19, color: C.ink, fit: 'shrink', margin: 0
  });
  bulletList(slide, [
    'проанализировать требования к интернет-магазину электроники;',
    'спроектировать архитектуру и базу данных;',
    'реализовать каталог, корзину и оформление заказа;',
    'разработать личный кабинет и административную панель.'
  ], 1.15, 3.0, 10.9, 2.5, 21);
}

{
  const n = nextNum();
  const slide = pptx.addSlide();
  addHeader(slide, 'Актуальность темы', n);
  stat(slide, '1', 'покупателю нужен быстрый подбор техники', 1.0, 1.35, C.red);
  stat(slide, '2', 'магазину требуется единая система заказов', 5.05, 1.35, C.blue);
  stat(slide, '3', 'администратору важно управлять витриной', 9.1, 1.35, C.green);
  card(slide, 1.15, 3.45, 11.0, 1.55, C.soft, C.gray);
  slide.addText('TechnoStore объединяет каталог, корзину, заказы, пользователей и администрирование в одном веб-приложении.', {
    x: 1.55, y: 3.86, w: 10.2, h: 0.62, fontFace: 'Times New Roman', fontSize: 27, bold: true, color: C.ink, align: 'center', fit: 'shrink', margin: 0
  });
}

{
  const n = nextNum();
  const slide = pptx.addSlide();
  addHeader(slide, 'Анализ существующих решений', n);
  const rows = [
    ['Критерий', 'Типовая проблема', 'Решение в TechnoStore'],
    ['Каталог', 'сложно быстро найти товар', 'поиск и фильтры'],
    ['Выбор товара', 'мало данных для сравнения', 'характеристики, отзывы, сравнение'],
    ['Заказы', 'ручная обработка', 'корзина и статусы'],
    ['Управление', 'витрина отделена от учёта', 'административная панель']
  ];
  slide.addTable(rows.map((r, i) => r.map(text => ({ text, options: i === 0 ? { bold: true, color: C.white, fill: { color: C.redDark } } : {} }))), {
    x: 0.9, y: 1.35, w: 11.55, h: 3.4,
    colW: [2.4, 4.05, 5.1],
    fontFace: 'Times New Roman',
    fontSize: 16.5,
    color: C.ink,
    margin: 0.08,
    border: { type: 'solid', color: C.gray, pt: 1 },
    valign: 'mid'
  });
  slide.addText('Вывод: собственная разработка позволяет учесть нужные функции и структуру данных проекта.', { x: 1.3, y: 5.45, w: 10.7, h: 0.35, fontFace: 'Times New Roman', fontSize: 20, bold: true, color: C.ink, align: 'center', margin: 0 });
}

{
  const n = nextNum();
  const slide = pptx.addSlide();
  addHeader(slide, 'Методы и технологии разработки', n);
  bulletList(slide, [
    'системный анализ предметной области;',
    'проектирование клиент-серверной архитектуры;',
    'моделирование реляционной базы данных;',
    'разработка и проверка пользовательских сценариев.'
  ], 0.95, 1.4, 5.25, 3.0, 20);
  const tech = ['Next.js', 'React', 'TypeScript', 'Prisma', 'PostgreSQL', 'Redis'];
  tech.forEach((t, i) => {
    const x = 6.85 + (i % 2) * 2.55;
    const y = 1.35 + Math.floor(i / 2) * 1.15;
    card(slide, x, y, 2.25, 0.75, i % 2 ? C.blueLight : C.redLight, i % 2 ? C.blue : C.red);
    slide.addText(t, { x: x + 0.12, y: y + 0.24, w: 2.0, h: 0.18, fontFace: 'Times New Roman', fontSize: 18, bold: true, color: C.ink, align: 'center', margin: 0 });
  });
}

{
  const n = nextNum();
  const slide = pptx.addSlide();
  addHeader(slide, 'Архитектура приложения', n);
  const layers = [
    ['Next.js App Router', 'страницы магазина, кабинета и админ-панели', C.red],
    ['API routes', 'серверные обработчики запросов', C.amber],
    ['Service layer', 'бизнес-логика заказов, корзины и промокодов', C.blue],
    ['Repository layer', 'доступ к данным через Prisma ORM', C.green],
    ['PostgreSQL + Redis', 'основная БД и кэш каталога', C.redDark]
  ];
  layers.forEach(([title, desc, color], i) => {
    const x = 0.85 + i * 2.45;
    card(slide, x, 1.65, 2.0, 1.45, C.white, color);
    slide.addText(title, { x: x + 0.15, y: 1.93, w: 1.7, h: 0.26, fontFace: 'Times New Roman', fontSize: 15.5, bold: true, color, align: 'center', fit: 'shrink', margin: 0 });
    slide.addText(desc, { x: x + 0.18, y: 2.32, w: 1.64, h: 0.38, fontFace: 'Times New Roman', fontSize: 11.5, color: C.ink, align: 'center', fit: 'shrink', margin: 0 });
    if (i < layers.length - 1) slide.addShape(pptx.ShapeType.chevron, { x: x + 2.04, y: 2.15, w: 0.32, h: 0.38, fill: { color: C.gray }, line: { color: C.gray } });
  });
  card(slide, 1.35, 4.15, 4.75, 1.05, C.blueLight, C.blue);
  slide.addText('Защита и авторизация', { x: 1.75, y: 4.38, w: 3.95, h: 0.22, fontFace: 'Times New Roman', fontSize: 18.5, bold: true, color: C.ink, align: 'center', margin: 0 });
  slide.addText('SMS + JWT в httpOnly cookie, проверка роли в middleware и API', { x: 1.65, y: 4.72, w: 4.15, h: 0.24, fontFace: 'Times New Roman', fontSize: 14, color: C.ink, align: 'center', fit: 'shrink', margin: 0 });
  card(slide, 7.1, 4.15, 4.75, 1.05, C.greenLight, C.green);
  slide.addText('Кэширование и устойчивость', { x: 7.5, y: 4.38, w: 3.95, h: 0.22, fontFace: 'Times New Roman', fontSize: 18.5, bold: true, color: C.ink, align: 'center', margin: 0 });
  slide.addText('Redis ускоряет каталог, при сбое данные загружаются из PostgreSQL', { x: 7.4, y: 4.72, w: 4.15, h: 0.24, fontFace: 'Times New Roman', fontSize: 14, color: C.ink, align: 'center', fit: 'shrink', margin: 0 });
}

const screens = [
  ['Каталог', ['сетка карточек товаров;', 'поиск по названию;', 'фильтры по категории, бренду и цене.'], 'Каталог товаров', 'Раздел с карточками, поиском и фильтрами слева'],
  ['Карточка товара', ['фотография и характеристики;', 'избранное и сравнение;', 'отзывы и рейтинг.'], 'Страница товара', 'Экран с описанием, ценой, рейтингом и действиями пользователя'],
  ['Корзина и оформление заказа', ['корзина авторизованного пользователя;', 'проверка состава заказа;', 'оформление с оплатой при получении.'], 'Корзина и заказ', 'Экран со списком товаров, итоговой суммой и подтверждением заказа'],
  ['Личный кабинет', ['вход по SMS-коду;', 'история заказов;', 'данные пользователя.'], 'Личный кабинет пользователя', 'Профиль с персональными данными и историей заказов'],
  ['Административная панель', ['товары, категории и бренды;', 'заказы и пользователи;', 'отзывы и промокоды.'], 'Административная панель', 'Интерфейс управления каталогом, заказами и пользователями']
];

for (const [title, items, label, detail] of screens) {
  const n = nextNum();
  const slide = pptx.addSlide();
  addHeader(slide, title, n);
  bulletList(slide, items, 0.95, 1.55, 4.0, 2.25, 21);
  placeholder(slide, 5.25, 1.25, 7.1, 4.95, label, detail);
}

{
  const n = nextNum();
  const slide = pptx.addSlide();
  addHeader(slide, 'Основные проектные решения', n);
  const items = [
    ['Авторизация', 'SMS-код и httpOnly cookie', C.red],
    ['Данные', 'PostgreSQL и Prisma ORM', C.blue],
    ['Заказ', 'серверный расчёт и транзакции', C.green],
    ['Защита', 'проверка ролей и прав доступа', C.amber]
  ];
  items.forEach(([t, d, color], i) => {
    const x = 1.0 + (i % 2) * 5.9;
    const y = 1.45 + Math.floor(i / 2) * 2.0;
    card(slide, x, y, 5.0, 1.25, C.white, color);
    slide.addText(t, { x: x + 0.35, y: y + 0.27, w: 4.25, h: 0.25, fontFace: 'Times New Roman', fontSize: 20, bold: true, color, margin: 0 });
    slide.addText(d, { x: x + 0.35, y: y + 0.68, w: 4.25, h: 0.24, fontFace: 'Times New Roman', fontSize: 17, color: C.ink, margin: 0 });
  });
}

{
  const n = nextNum();
  const slide = pptx.addSlide();
  addBackground(slide, 'title');
  slide.addText('Результаты работы', { x: 0.85, y: 0.72, w: 11.7, h: 0.58, fontFace: 'Times New Roman', fontSize: 36, bold: true, color: C.ink, align: 'center', margin: 0 });
  bulletList(slide, [
    'разработано веб-приложение интернет-магазина электроники TechnoStore;',
    'реализованы каталог, карточка товара, корзина и оформление заказа;',
    'созданы личный кабинет покупателя и административная панель;',
    'подготовлена техническая основа для развития проекта.'
  ], 1.25, 1.85, 10.9, 3.2, 27);
  addFooter(slide, n);
}

pptx.writeFile({ fileName: 'docs/technostore_diploma_presentation.pptx' });
