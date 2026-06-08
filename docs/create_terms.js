const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageNumber, Footer } = require('docx');
const out = '/data/Projects/diplom/docs/thesis/перечень-условных-обозначений.docx';
const items = [
  ['API', 'Application Programming Interface (программный интерфейс приложения).'],
  ['CRUD', 'Create, Read, Update, Delete (операции создания, чтения, изменения и удаления данных).'],
  ['CSS', 'Cascading Style Sheets (каскадные таблицы стилей).'],
  ['HTTP', 'HyperText Transfer Protocol (протокол передачи гипертекста).'],
  ['HTTPS', 'HyperText Transfer Protocol Secure (защищённый протокол передачи гипертекста).'],
  ['JSON', 'JavaScript Object Notation (текстовый формат обмена структурированными данными).'],
  ['JSONB', 'двоичный формат хранения JSON-данных в системе управления базами данных PostgreSQL.'],
  ['JWT', 'JSON Web Token (подписанный токен для передачи данных авторизации).'],
  ['ORM', 'Object-Relational Mapping (объектно-реляционное отображение данных).'],
  ['REST', 'Representational State Transfer (архитектурный стиль взаимодействия компонентов веб-приложения).'],
  ['SHA-256', 'Secure Hash Algorithm 256-bit (алгоритм криптографического хэширования).'],
  ['SMS', 'Short Message Service (служба коротких сообщений).'],
  ['SQL', 'Structured Query Language (язык структурированных запросов).'],
  ['URL', 'Uniform Resource Locator (адрес ресурса в сети).'],
  ['БД', 'база данных.'],
  ['ВКРБ', 'выпускная квалификационная работа бакалавра.'],
  ['ПМР', 'Приднестровская Молдавская Республика.'],
  ['СУБД', 'система управления базами данных.'],
  ['Аутентификация', 'проверка личности пользователя на основании предъявленных учётных данных.'],
  ['Авторизация', 'определение и предоставление прав доступа аутентифицированному пользователю.'],
  ['Идемпотентность', 'свойство операции, при котором её повторное выполнение с теми же данными не изменяет результат после первого успешного выполнения.'],
  ['Кэширование', 'временное хранение часто запрашиваемых данных для ускорения повторного доступа.'],
  ['Курсорная пагинация', 'способ постраничной загрузки, при котором следующая часть данных запрашивается относительно последней полученной записи.'],
  ['Мягкое удаление', 'исключение записи из активных данных без её физического удаления из базы данных.'],
  ['Транзакция', 'последовательность операций с базой данных, выполняемая как единое целое.']
];
function textRuns(term, definition) {
  return [
    new TextRun({ text: term, font: 'Times New Roman', size: 28, bold: false }),
    new TextRun({ text: ' — ' + definition, font: 'Times New Roman', size: 28 })
  ];
}
const children = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: 360, after: 400 },
    pageBreakBefore: true,
    children: [new TextRun({ text: 'ПЕРЕЧЕНЬ УСЛОВНЫХ ОБОЗНАЧЕНИЙ, СИМВОЛОВ, ЕДИНИЦ И ТЕРМИНОВ', font: 'Times New Roman', size: 28, bold: true })]
  }),
  ...items.map(([term, definition]) => new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
    indent: { firstLine: 709 },
    children: textRuns(term, definition)
  }))
];
const doc = new Document({
  styles: { default: { document: { run: { font: 'Times New Roman', size: 28 }, paragraph: { spacing: { line: 360 }, alignment: AlignmentType.JUSTIFIED } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 850, bottom: 1134, left: 1701 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 24 })] })] }) },
    children
  }]
});
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(out, buf); console.log(out); });
