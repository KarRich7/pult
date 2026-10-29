# 📋 Шпаргалка: Подготовка и сборка iOS-приложения без ошибок

Полное пошаговое руководство по подготовке, проверке и сборке приложения **Philips Remote** (Expo SDK 58 / React Native 0.88) в файл `.ipa` через **GitHub Actions** без ошибок.

---

## 🧭 Экспресс-чеклист перед сборкой

Выполните эти 4 шага в терминале перед отправкой кода в GitHub:

```bash
# 1. Проверить совместимость всех библиотек с версией Expo SDK
npx expo-doctor

# 2. Если есть конфликты версий — автоматически исправить их
npx expo install --fix

# 3. Убедиться, что проект запускается и нет ошибок компиляции JS
npx expo start -c

# 4. Проверить статус Git (нет ли мусорных файлов)
git status
```

---

## ⚙️ 1. Управление зависимостями: золотые правила Expo

В проектах на Expo нельзя устанавливать системные модули через обычный `npm install <пакет>`, так как npm может поставить версию пакета, несовместимую с текущим движком Expo и React Native.

### ✅ Как правильно:
- **Установка пакетов:**
  ```bash
  npx expo install <название-пакета>
  ```
  *Пример:* `npx expo install expo-haptics`  
  *Expo сам подберет точную версию, протестированную с вашей версией Expo SDK.*

- **Исправление несовместимых версий:**
  ```bash
  npx expo install --fix
  ```

- **Глубокая диагностика проекта:**
  ```bash
  npx expo-doctor
  ```
  *Результат должен быть: `20/20 checks passed. No issues detected!`*

> [!TIP]
> Если проект ведет себя странно после обновления пакетов, очистите кэш Metro bundler:
> ```bash
> npx expo start -c
> ```

---

## 🛠 2. Настройка `app.json` (Параметры iOS)

Файл [`app.json`](file:///c:/Users/vysot/Документы/ChatGPT/TV/ПУЛЬТ/app.json) является единым источником конфигурации для генерации нативного проекта iOS (`expo prebuild`).

Перед сборкой убедитесь в наличии следующих критически важных параметров:

```json
{
  "expo": {
    "name": "Philips Remote 46PFL8606H",
    "slug": "philips-remote",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.philips.remote8606",
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true,
          "NSAllowsLocalNetworking": true
        },
        "NSLocalNetworkUsageDescription": "Приложению требуется доступ к локальной сети Wi-Fi для обнаружения и управления телевизором Philips Smart TV."
      }
    }
  }
}
```

### На что обратить внимание:
1. **`bundleIdentifier`**: Уникальный идентификатор приложения (например, `com.philips.remote8606`). Не должен содержать пробелов и спецсимволов.
2. **`NSLocalNetworkUsageDescription`**: Обязательное описание в iOS для доступа к локальной сети. Без него iOS заблокирует отправку HTTP-запросов к телевизору или отклонит запуск.
3. **Иконка (`icon`)**: Файл [`assets/icon.png`](file:///c:/Users/vysot/Документы/ChatGPT/TV/ПУЛЬТ/assets/icon.png) должен существовать и иметь размер 1024x1024 px (PNG без прозрачности для App Store, либо с альфа-каналом для ad-hoc).

---

## 🚀 3. Как устроена сборка в GitHub Actions

Сборка происходит автоматически в облаке GitHub Actions по сценарию [`.github/workflows/build-ios.yml`](file:///c:/Users/vysot/Документы/ChatGPT/TV/ПУЛЬТ/.github/workflows/build-ios.yml).

### Главные причины прошлых ошибок и как они решены:

| Проблема | Причина | Правильное решение |
| :--- | :--- | :--- |
| `error: failed to build module 'ExpoModulesCore'; this SDK is not supported by the compiler` | В Expo 58 предсобранные бинарники скомпилированы под **Swift 6.3.1 (Xcode 26)**. Попытка сборки в устаревшем Xcode 16.2 (`macos-14`) вызывает отказ компилятора. | Использовать раннер **`runs-on: macos-15`** и динамический выбор актуальной версии **Xcode 26.x**. |
| `converting non-escaping parameter 'operation' to generic parameter 'T'` | Ручные патчи (`patch-swift6.js`) пытались переписать исходный Swift-код Expo, ломая безопасность акторов и типов. | **Не патчить исходники Expo.** В родной среде Xcode 26 код компилируется без изменений. |
| Ошибки сертификатов Apple (`Signing Failed`) | У большинства пользователей нет платного аккаунта разработчика Apple Developer Program ($99/год). | Использовать **Ad-Hoc / Unsigned** конфигурацию (`CODE_SIGN_IDENTITY="-"`, `CODE_SIGNING_REQUIRED=NO`). Приложение подписывается на стороне пользователя при установке (AltStore / Sideloadly). |

### Этапы сборки в GitHub Actions:
1. **Подготовка раннера:** `macos-15` с выбором новейшего Xcode.
2. **Установка зависимостей:** `npm ci`.
3. **Expo Prebuild:** `npx expo prebuild --platform ios --clean` (генерация нативной папки `ios/`).
4. **CocoaPods:** `pod install` (линковка нативных библиотек).
5. **Ad-Hoc подпись:** Переключение `project.pbxproj` в режим Manual Ad-Hoc.
6. **Компиляция Xcode:** `xcodebuild -configuration Release`.
7. **Упаковка:** Формирование структуры `Payload/PhilipsRemote.app` и сжатие в `PhilipsRemote.ipa`.
8. **Публикация:** Загрузка артефакта и прикрепление к [GitHub Releases](https://github.com/KarRich7/pult/releases).

---

## 🔄 4. Пошаговый процесс обновления и повторной сборки

Когда вы внесли изменения в код (например, добавили новые кнопки или изменили стили):

### Шаг 1. Тестирование изменений локально
```bash
# Запустите проект и проверьте в браузере или на телефоне
npx expo start
```

### Шаг 2. Проверка здоровья проекта
```bash
npx expo-doctor
```

### Шаг 3. Фиксация и отправка изменений на GitHub
```bash
# Добавить измененные файлы
git add .

# Создать коммит с понятным описанием
git commit -m "feat: добавил новые функции и обновил интерфейс"

# Отправить в репозиторий на GitHub
git push origin main
```

### Шаг 4. Контроль сборки
1. Откройте страницу репозитория: [https://github.com/KarRich7/pult/actions](https://github.com/KarRich7/pult/actions).
2. Вы увидите запущенную сборку **«Build iOS IPA»**.
3. Нажмите на неё, чтобы наблюдать за шагами компиляции в реальном времени.
4. Обычное время сборки: **~5–7 минут**.

---

## 📲 5. Как скачать и установить готовый `.ipa` на iPhone

После успешного завершения сборки:

1. Перейдите во вкладку [Releases](https://github.com/KarRich7/pult/releases) (или в блок *Artifacts* завершенного workflow).
2. Скачайте файл **`PhilipsRemote.ipa`**.

### Способы установки:

### Вариант A. TrollStore (iOS 14.0 – 16.6.1 / 17.0) — Самый простой
- Отправьте `.ipa` на iPhone (через AirDrop, Telegram, iCloud Drive).
- Нажмите «Поделиться» -> выберите **TrollStore**.
- Приложение установится мгновенно и будет работать **бессрочно без переподписания**.

### Вариант B. Sideloadly (ПК на Windows / Mac) — Для всех версий iOS
1. Скачайте и установите **Sideloadly** на компьютер.
2. Подключите iPhone к компьютеру через USB-кабель.
3. Перетащите скачанный `PhilipsRemote.ipa` в окно Sideloadly.
4. Введите ваш Apple ID (пароль передается напрямую на сервера Apple).
5. Нажмите **Start**. Через минуту приложение появится на экране iPhone.
6. На телефоне перейдите в:  
   *Настройки -> Основные -> VPN и управление устройством* -> выберите ваш Apple ID и нажмите **«Доверять»**.

### Вариант C. AltStore / Scarlet / ESign
- Поддерживается прямая установка и автоматическое беспроводное переподписание по Wi-Fi.

---

## 🆘 6. Решение возможных проблем (Troubleshooting)

### Ошибка 1: `npm error code ERESOLVE` при установке пакетов
- **Причина:** Конфликт версий зависимостей.
- **Решение:**
  ```bash
  npm cache clean --force
  npx expo install --fix
  ```

### Ошибка 2: Приложение не видит телевизор в сети Wi-Fi
- **Причина 1:** Телевизор и iPhone находятся в разных подсетях (например, iPhone на 5 GHz, а ТВ на 2.4 GHz с изоляцией клиентов AP Isolation).
  - *Решение:* Отключите «Изоляцию клиентов» (Client Isolation) в настройках роутера.
- **Причина 2:** На телевизоре не активирован JointSpace.
  - *Решение:* На физическом пульте ТВ быстро наберите цифры `5 6 4 6 8 7 7 2 2 3`. На экране должно появиться подтверждение `JointSpace enabled`.

### Ошибка 3: `xcodebuild failed` в GitHub Actions
- **Что делать:**
  1. В упавшем запуске Actions откройте блок **Artifacts** внизу страницы.
  2. Скачайте архив **`Xcodebuild-Log`**.
  3. Откройте `xcodebuild.log` и найдите строки со словом `error:`.
  4. 99% ошибок связаны либо с несовместимостью версии Swift/Xcode, либо с опечатками в коде/импортах JavaScript.
