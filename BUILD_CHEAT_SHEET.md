# 📱 Универсальная шпаргалка: Сборка любого Expo / React Native проекта в iOS IPA через GitHub Actions

> **Для чего этот документ:**  
> Этот файл можно скопировать в **любой** проект на Expo / React Native. Любой разработчик или нейросеть (AI-ассистент), прочитав этот документ, сможет с нуля настроить и запустить гарантированно рабочую сборку автономного файла `.ipa` для iPhone без платного аккаунта Apple Developer ($99/год) и без необходимости иметь компьютер Mac.

---

## ⚡ Экспресс-инструкция по запуску в новом проекте (За 3 шага)

Если вы только что скопировали этот файл в новый проект, вот что нужно сделать:

1. **Проверьте зависимости проекта в терминале:**
   ```bash
   npx expo-doctor
   npx expo install --fix
   ```
2. **Убедитесь, что в `app.json` указан `bundleIdentifier`:**
   ```json
   "ios": {
     "supportsTablet": true,
     "bundleIdentifier": "com.yourname.yourapp"
   }
   ```
3. **Создайте файл `.github/workflows/build-ios.yml`** и вставьте в него [готовый код workflow](#-2-готовый-универсальный-файл-github-actions-workflow) из Раздела 2 этого документа.
4. **Отправьте изменения на GitHub:**
   ```bash
   git add .
   git commit -m "ci: add iOS IPA build workflow"
   git push origin main
   ```
Сборка начнется автоматически во вкладке **Actions** на GitHub и выдаст готовый `.ipa`!

---

## 📦 1. Подготовка конфигурации проекта (`app.json` и зависимости)

### А. Управление зависимостями (Золотые правила Expo)
В проектах Expo системные модули должны строго соответствовать установленной версии Expo SDK:

- **Никогда не используйте обычный `npm install <native-lib>` для нативных библиотек.**  
  Всегда используйте официальный установщик Expo:
  ```bash
  npx expo install <название-библиотеки>
  ```
  *Пример:* `npx expo install expo-haptics expo-linear-gradient`
- **Проверка совместимости версий:**
  ```bash
  npx expo-doctor
  ```
  *Команда проверяет 20+ параметров проекта. Если есть предупреждения о версиях — выполните команду ниже.*
- **Автоматическое исправление всех версий под текущий SDK:**
  ```bash
  npx expo install --fix
  ```

---

### Б. Обязательные поля в `app.json`
Файл `app.json` — это единственный источник правды для генератора нативного iOS-проекта (`expo prebuild`). Убедитесь, что блок `"ios"` содержит следующие настройки:

```json
{
  "expo": {
    "name": "Название Приложения",
    "slug": "app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.yourapp",
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true,
          "NSAllowsLocalNetworking": true
        },
        "NSLocalNetworkUsageDescription": "Описание, зачем приложению доступ к Wi-Fi / локальной сети (если нужно)."
      }
    }
  }
}
```

> [!IMPORTANT]
> - `bundleIdentifier` обязателен! Без него Xcode не сможет скомпилировать проект. Формат: `com.company.appname` (только латинские буквы, точки и цифры, без пробелов).
> - Файл иконки `./assets/icon.png` должен физически существовать в проекте (квадратный PNG, желательно 1024x1024).

---

## 🚀 2. Готовый универсальный файл GitHub Actions Workflow

Создайте в корне проекта файл по пути `.github/workflows/build-ios.yml` и скопируйте в него следующий код.

Этот workflow:
- Автоматически находит актуальную версию Xcode на раннере `macos-15` (подходит для любых версий Expo, включая Expo 51, 52, 53, 58+).
- Сам определяет имя схемы (`scheme`) и рабочего пространства (`workspace`) без жесткой привязки к конкретному проекту.
- Настраивает проект в режим **Ad-Hoc / Manual signing**, исключая ошибки отсутствия сертификатов разработчика Apple.
- Пакует скомпилированный бандл `.app` в финальный архив `.ipa` с вычислением SHA256.
- Сохраняет `.ipa` в артефакты сборки и автоматически создает релиз в **GitHub Releases**.

```yaml
name: Build iOS IPA

on:
  push:
    branches:
      - main
      - master
    paths-ignore:
      - '**.md'
      - '.gitignore'
      - 'LICENSE'
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      create_release:
        description: 'Publish as GitHub Release?'
        required: false
        type: boolean
        default: true

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-ipa:
    name: Build Unsigned IPA
    runs-on: macos-15
    timeout-minutes: 45
    permissions:
      contents: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Ensure Node in Xcode PATH
        run: |
          sudo mkdir -p /usr/local/bin
          sudo ln -sf "$(which node)" /usr/local/bin/node || true
          echo "NODE_BINARY=$(which node)" >> $GITHUB_ENV
          echo "Node version: $(node -v)"
          echo "Node path: $(which node)"

      - name: Select Latest Xcode
        run: |
          echo "=== Available Xcode versions in /Applications ==="
          ls -ld /Applications/Xcode* || true

          # Автоматически выбираем наивысшую доступную версию Xcode
          LATEST_XCODE=$(find /Applications -maxdepth 1 -name "Xcode*.app" | sort -V | tail -n 1)
          if [ -n "$LATEST_XCODE" ]; then
            echo "Selecting highest Xcode: $LATEST_XCODE"
            sudo xcode-select -s "$LATEST_XCODE"
          fi
          xcodebuild -version

      - name: Install npm dependencies
        run: npm ci

      - name: Expo Prebuild (Generate native iOS project)
        run: |
          npx expo prebuild --platform ios --clean

      - name: Ensure CocoaPods Dependencies
        run: |
          cd ios
          pod install || pod install --repo-update
          cd ..

      - name: Configure Xcode Project for Ad-Hoc Signing
        run: |
          # Переключаем подписание в Ad-Hoc режим для установки через AltStore / Sideloadly / TrollStore
          find ios -name "project.pbxproj" -exec sed -i '' 's/CODE_SIGN_STYLE = Automatic;/CODE_SIGN_STYLE = Manual;/g' {} + || true
          find ios -name "project.pbxproj" -exec sed -i '' 's/CODE_SIGN_IDENTITY = "iPhone Developer";/CODE_SIGN_IDENTITY = "-";/g' {} + || true
          find ios -name "project.pbxproj" -exec sed -i '' 's/CODE_SIGN_IDENTITY = "Apple Development";/CODE_SIGN_IDENTITY = "-";/g' {} + || true
          find ios -name "project.pbxproj" -exec sed -i '' 's/DEVELOPMENT_TEAM = [^;]*;/DEVELOPMENT_TEAM = "";/g' {} + || true
          find ios -name "project.pbxproj" -exec sed -i '' 's/PROVISIONING_PROFILE_SPECIFIER = [^;]*;/PROVISIONING_PROFILE_SPECIFIER = "";/g' {} + || true
          find ios -name "project.pbxproj" -exec sed -i '' 's/CODE_SIGNING_REQUIRED = YES;/CODE_SIGNING_REQUIRED = NO;/g' {} + || true

          # Отключаем компиляцию тестов во время релизной сборки
          find ios -name "*.xcscheme" -exec sed -i '' 's/buildForTesting = "YES"/buildForTesting = "NO"/g' {} + || true

      - name: Build iOS App (.app)
        run: |
          WORKSPACE=$(find ios -name "*.xcworkspace" -maxdepth 1 | head -n 1)
          PROJECT=$(find ios -name "*.xcodeproj" -maxdepth 1 | head -n 1)
          echo "Found workspace: $WORKSPACE"
          echo "Found project: $PROJECT"
          
          # Автоматическое определение главной схемы приложения
          SCHEME=$(xcodebuild -project "$PROJECT" -list -json | jq -r '.project.schemes[0]')
          if [ -z "$SCHEME" ] || [ "$SCHEME" = "null" ]; then
            SCHEME=$(xcodebuild -workspace "$WORKSPACE" -list -json | jq -r '[.workspace.schemes[] | select(startswith("Pods-") | not)][0]')
          fi
          echo "===> Selected Target App Scheme: $SCHEME <==="

          mkdir -p build/DerivedData

          set -o pipefail
          xcodebuild \
            -workspace "$WORKSPACE" \
            -scheme "$SCHEME" \
            -configuration Release \
            -destination "generic/platform=iOS" \
            -derivedDataPath build/DerivedData \
            COMPILER_INDEX_STORE_ENABLE=NO \
            CODE_SIGN_IDENTITY="-" \
            CODE_SIGNING_REQUIRED=NO \
            CODE_SIGNING_ALLOWED=YES \
            AD_HOC_CODE_SIGNING_ALLOWED=YES \
            CODE_SIGN_STYLE=Manual \
            PROVISIONING_PROFILE_SPECIFIER="" \
            PROVISIONING_PROFILE="" \
            build 2>&1 | tee build/xcodebuild.log || {
              echo "==================== XCODEBUILD FAILED ===================="
              tail -n 150 build/xcodebuild.log
              exit 1
            }

      - name: Package into IPA
        run: |
          echo "=== Searching for .app bundles in build directory ==="
          find build -name "*.app" -type d -ls || true

          APP_DIR=$(find build/DerivedData/Build/Products -name "*.app" -type d | head -n 1)
          if [ -z "$APP_DIR" ]; then
            APP_DIR=$(find build -name "*.app" -type d | head -n 1)
          fi
          echo "Compiled app bundle: $APP_DIR"
          
          if [ -z "$APP_DIR" ]; then
            echo "Error: .app bundle not found!"
            exit 1
          fi

          mkdir -p build/Payload
          cp -R "$APP_DIR" build/Payload/
          
          cd build
          zip -r -q "Application.ipa" Payload
          shasum -a 256 "Application.ipa" > "Application.ipa.sha256"
          echo "Created Application.ipa successfully."
          ls -lh Application.ipa
          cat Application.ipa.sha256
          cd ..

      - name: Upload Build Log on Failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: Xcodebuild-Log
          path: build/xcodebuild.log
          retention-days: 7

      - name: Upload IPA to GitHub Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: iOS-IPA-Bundle
          path: |
            build/Application.ipa
            build/Application.ipa.sha256
          retention-days: 14

      - name: Create GitHub Release
        if: startsWith(github.ref, 'refs/tags/') || github.event.inputs.create_release == 'true' || github.event.inputs.create_release == true || github.ref == 'refs/heads/main'
        continue-on-error: true
        uses: softprops/action-gh-release@v2
        with:
          files: |
            build/Application.ipa
            build/Application.ipa.sha256
          name: ${{ github.ref_name || 'v1.0.0' }}
          tag_name: ${{ startsWith(github.ref, 'refs/tags/') && github.ref_name || 'v1.0.0' }}
          draft: false
          prerelease: false
          body: |
            ### 📱 iOS IPA Application Build
            
            Автономная Ad-Hoc сборка приложения для iPhone / iPad.
            
            **Установка на устройство:**
            - **TrollStore:** Устанавливается напрямую в 1 клик (без ограничений по сертификатам).
            - **AltStore / Sideloadly / Scarlet / ESign:** Скачайте файл `.ipa` и установите через компьютер или приложение на телефоне (программа автоматически подпишет приложение вашим бесплатным Apple ID).
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 🔍 3. Главные подводные камни (Почему обычно падают сборки)

### 1. Ошибка несовместимости версий Xcode и Expo SDK
```text
error: failed to build module 'ExpoModulesCore'; this SDK is not supported by the compiler
(the SDK is built with 'Apple Swift version 6.3.1', while this compiler is 'Apple Swift version 6.0.3').
Please select a toolchain which matches the SDK.
```
- **Почему возникает:** Новые версии Expo (начиная с SDK 52/53/58) поставляют предсобранные бинарники (`ExpoModulesCore.xcframework`), скомпилированные актуальной версией Swift/Xcode. Если в GitHub Actions запустить старый раннер `macos-14` с `Xcode 16.2`, компилятор Swift физически не сможет прочитать интерфейсы модулей.
- **Как избежать:** Всегда ставить `runs-on: macos-15` (или новее) и выбирать новейший доступный Xcode.

### 2. Ошибки попытки ручной модификации исходников Expo (`patch-swift...`)
- **Почему возникает:** Разработчики часто пытаются решить ошибку выше написанием скриптов на `sed` или `node`, понижающих `swift-tools-version: 6.0` в `Package.swift`. Это ломает безопасность акторов, генерирует ошибки типов `converting non-escaping parameter to generic parameter may allow it to escape` и делает проект несобираемым.
- **Как избежать:** Никаких ручных патчей библиотек Expo не требуется, если используется правильная версия Xcode на раннере.

### 3. Ошибки подписи кода (Signing / Provisioning Profile)
```text
Code signing is required for product type 'Application' in SDK 'iOS'
No profile for team 'XXXXX' matching 'YYYYY' found
```
- **Почему возникает:** По умолчанию Xcode пытается подписать приложение через платный Apple Developer аккаунт.
- **Как избежать:** В шаге `Configure Xcode Project for Ad-Hoc Signing` мы принудительно переключаем проект на Ad-Hoc подпись (`CODE_SIGN_IDENTITY="-"`, `CODE_SIGNING_REQUIRED=NO`). Итоговый `.ipa` подписывается при установке бесплатным Apple ID через Sideloadly или ставится напрямую через TrollStore.

---

## 📲 4. Установка готового `.ipa` на iPhone

Готовый файл скачивается со страницы **Releases** (или из блока **Artifacts** завершенной сборки):

| Метод установки | Требования к iOS | Как ставить |
| :--- | :--- | :--- |
| **TrollStore** | iOS 14.0 – 16.6.1 / 17.0 | Открыть файл `.ipa` на телефоне через кнопку «Поделиться» -> TrollStore. Устанавливается мгновенно, работает вечно без переподписания. |
| **Sideloadly** | Любая версия iOS | Установить Sideloadly на ПК (Windows/Mac) -> подключить iPhone проводом -> перетащить `.ipa` -> ввести бесплатный Apple ID -> нажать Start. |
| **AltStore** | Любая версия iOS | Установить AltServer на ПК -> установить AltStore на телефон -> открывать `.ipa` прямо на телефоне с авто-обновлением по Wi-Fi. |
| **Scarlet / ESign** | Любая версия iOS | Прямая установка прямо с телефона при наличии действующего корпоративного или личного сертификата. |

---

## 📋 5. Чек-лист перед каждым коммитом в репозиторий

Перед тем как отправить код в репозиторий:
- [ ] Запущен `npx expo-doctor` и результат: `All checks passed!`
- [ ] В `app.json` прописан корректный `bundleIdentifier`.
- [ ] Приложение запускается локально командой `npx expo start -c` без фатальных ошибок JavaScript.
- [ ] Все временные файлы или тяжелые логи удалены или добавлены в `.gitignore`.
