# Тестовое на вакансию Fullstack Node.js Developer

[Тестовое задание](https://www.notion.so/fundraiseup/160859a0d10b499ea2ff8ac2fa92f26a). Прочитайте его до конца перед началом выполнения. Если возникли вопросы, вы можете их задать рекрутеру, он передаст их разработчикам.

#### Установка зависимостей:

```
npm i
```

#### Сборка проекта:

```
npm run build
```

#### Запуск проекта:

```
npm run run
```

Конфигурация лежит по пути ./config/default.json

compose.yaml использовался для запуска базы, а не сборки проекта, вам же все равно, как я базу запускал, насколько я понял?

Как работает очередь отправки событий:

- отправляем события сразу, но не чаще раза в секунду, или если накопилось в буфере хотя бы три события
- так же есть в интерфейсе метод, который принудительно отправляет все события, он и вешается на событие закрытия браузера (спокойно, это внутренний объект, внешний интерфейс все так же с одним методом)
- если сбой, то функция отправки должна вернуть true и тогда мы кладем все события в основной буфер и опять заводим секундный таймер и теперь все события(в том числе те, что пришли за время ожидания таймера) из буфера отправляются одним запросом, что оптимальнее
- вообще апи добавления события асинхронный и когда его вызывали синхронно(без await), то событие дублировалось, т к в буфере оставалось старое событие и удалялось только после ответа сервера, который отвечал не так быстро, а за время ответа появлялись еще запросы, которые отправляли старое событие, что вызывало баг. Это обстоятельство привело к дополнительной сложности и появился буфер событий в процессе отправки и если события в нем не отправились, то возвращаются в основной буфер, а если отправились, то удаляются.
- каждая отправка на сервер не ожидается и сразу вызывается таймер, не важно откуда эта отправка произошла, прервать это может либо количество событий в очереди больше 2, что вызывает принудительную отправку, либо сама принудительная отправка. Принудительная отправка вызывается по событию закрытия браузера.

На все это, конечно, есть тесты. Кто-то вообще решал эту задачу без тестов? Получилось? Так же есть тесты на валидацию входного списка событий. Из задачи не ясно как надо было валидировать, поэтому я сделал, как посчитал нужным. Тесты могут вызывать проблемы, надеюсь Вам не придется в них вникать, но я старался сделать их адекватными.

Простите за дерзкий файл `trackScript.ts`. Я не знаю, принципиально ли это, но не хочется сейчас с этим всем заморачиваться, вроде читать удобно. И, да, я могу переделать, если нужно, собрав все это дело через webpack.

Код написан часто(хотя далеко не везде) через агрегацию, а не композицию(если говорить в терминах ООП). Я не буду утверждать, что здесь это нужно, но в целом я стараюсь писать так, это мой стиль написания к которому я пришел. Опять же, если так читать не удобно - пишите, исправлю.

Если `if()` не в начале блока, то я обычно оставляю перед ним пустую строку:

```typescript
const isRepeatSending = await this.#send([...sendingBuffer]);

if (isRepeatSending)
  ...
```

Это мой стиль написания, который не всем удобен для чтения, но в команде я пишу, по правилам команды.

На первый взгляд мне показалось, что задача написания очереди проста, но в последствии тестирования(да, TDD здесь применить трудно) вылезали баги, которые как-то слабо уходили, на что и было потрачено много времени. Все остальное время заняла организация проекта(как подключиться к бд, как поднять бд, тесты, притер и т д, т к у меня не было никакого проекта-шаблона "на руках") и потом уже написание остальной логики и рефакторинг.

Задача мне не показалась легкой и тем боле СЛИШКОМ легкой, так что доп задание я не делал. Кто-то вообще говорил, что задача легкая? Он/она ее смог решить правильно?
