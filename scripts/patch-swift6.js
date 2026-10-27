const fs = require('fs');
const path = require('path');

const nodeModules = path.join(__dirname, '..', 'node_modules');

function patchDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '.git') patchDirectory(fullPath);
    } else if (entry.name.startsWith('Package.swift')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      // 1. Lower swift-tools-version to 6.0
      content = content.replace(/swift-tools-version:\s*6\.[12]/g, 'swift-tools-version: 6.0');
      // 2. Remove 6.2-only -Werror warning group flags
      content = content.replace(/.*"-Werror",\s*"(ImplicitStrongCapture|NoUsage)".*\n?/g, '');
      // 3. Remove trailing commas before closing parenthesis in function calls
      content = content.replace(/,\s*\)/g, '\n)');
      // 4. In expo-modules-jsi/apple/Package.swift, ensure required Swift 6.0 features are enabled
      if (fullPath.includes('expo-modules-jsi') && fullPath.includes('Package.swift')) {
        if (!content.includes('NonescapableTypes')) {
          content = content.replace(
            '.interoperabilityMode(.Cxx),',
            `.interoperabilityMode(.Cxx),
        .enableUpcomingFeature("NonisolatedNonsendingByDefault"),
        .enableUpcomingFeature("InferIsolatedConformances"),
        .enableExperimentalFeature("NonescapableTypes"),`
          );
        }
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Successfully patched for Swift 6.0:', fullPath);
      }
    }
  }
}

// 1. Patch Package.swift manifests
patchDirectory(nodeModules);

// 2. Patch RuntimeScheduler.h for SWIFT_RETURNS_RETAINED compatibility with Swift 6.0 / Clang
const schedulerHeader = path.join(nodeModules, 'expo-modules-jsi', 'apple', 'Sources', 'ExpoModulesJSI-Cxx', 'include', 'RuntimeScheduler.h');
if (fs.existsSync(schedulerHeader)) {
  let headerContent = fs.readFileSync(schedulerHeader, 'utf8');
  if (!headerContent.includes('#ifndef SWIFT_RETURNS_RETAINED')) {
    headerContent = headerContent.replace(
      '#include <swift/bridging>',
      '#include <swift/bridging>\n\n#ifndef SWIFT_RETURNS_RETAINED\n#define SWIFT_RETURNS_RETAINED\n#endif'
    );
    fs.writeFileSync(schedulerHeader, headerContent, 'utf8');
    console.log('Successfully patched RuntimeScheduler.h for Swift 6.0.');
  }
}

// 3. Patch JavaScriptError.swift to remove `public` member on C++ type extension
const jsErrorSwift = path.join(nodeModules, 'expo-modules-jsi', 'apple', 'Sources', 'ExpoModulesJSI', 'Runtime', 'Values', 'JavaScriptError.swift');
if (fs.existsSync(jsErrorSwift)) {
  let errContent = fs.readFileSync(jsErrorSwift, 'utf8');
  if (errContent.includes('public var message: String {')) {
    errContent = errContent.replace(
      'public var message: String {',
      'var message: String {'
    );
    fs.writeFileSync(jsErrorSwift, errContent, 'utf8');
    console.log('Successfully patched JavaScriptError.swift for Swift 6.0.');
  }
}

// 4. Patch JavaScriptActor.swift for Swift 6.0 actor isolation compatibility
const jsActorSwift = path.join(nodeModules, 'expo-modules-jsi', 'apple', 'Sources', 'ExpoModulesJSI', 'Runtime', 'JavaScriptActor.swift');
if (fs.existsSync(jsActorSwift)) {
  let actorContent = fs.readFileSync(jsActorSwift, 'utf8');
  if (!actorContent.includes('withoutActuallyEscaping')) {
    const oldPattern = /public static func assumeIsolated<T(?:|: ~Copyable)>\(_ operation: @JavaScriptActor \(\) -> T\) -> T \{[\s\S]*?return (?:runner\(operation\)|fn\(\))\s*\}/;
    if (oldPattern.test(actorContent)) {
      actorContent = actorContent.replace(
        oldPattern,
        `public static func assumeIsolated<T>(_ operation: @JavaScriptActor () -> T) -> T {
    return withoutActuallyEscaping(operation) { escapable in
      typealias NonisolatedFn = () -> T
      let fn = unsafeBitCast(escapable, to: NonisolatedFn.self)
      return fn()
    }
  }`
      );
      actorContent = actorContent.replace(
        'public static func assumeIsolated<T: ~Copyable, E: Error>(',
        'public static func assumeIsolated<T, E: Error>('
      );
      actorContent = actorContent.replace(
        'internal static func runIsolated<T: ~Copyable>(',
        'internal static func runIsolated<T>('
      );
      fs.writeFileSync(jsActorSwift, actorContent, 'utf8');
      console.log('Successfully patched JavaScriptActor.swift for Swift 6.0.');
    }
  } else {
    console.log('JavaScriptActor.swift is already patched.');
  }
}

// 5. Patch Task+immediate.swift for Swift 6.0 compatibility (no Task.immediate or name: in Task.init)
const taskImmediateSwift = path.join(nodeModules, 'expo-modules-jsi', 'apple', 'Sources', 'ExpoModulesJSI', 'Extensions', 'Task+immediate.swift');
if (fs.existsSync(taskImmediateSwift)) {
  let taskContent = fs.readFileSync(taskImmediateSwift, 'utf8');
  if (taskContent.includes('Task.immediate(')) {
    taskContent = taskContent.replace(
      /if #available[\s\S]*?return Task\(name: name, priority: \.high, operation: operation\)\s*\}/,
      'return Task(priority: priority ?? .high, operation: operation)'
    );
    fs.writeFileSync(taskImmediateSwift, taskContent, 'utf8');
    console.log('Successfully patched Task+immediate.swift for Swift 6.0.');
  }
}

// 6. Patch HostFunctionClosure.h for Swift 6.0 SWIFT_IMMORTAL_REFERENCE factory creation
const hostFnHeader = path.join(nodeModules, 'expo-modules-jsi', 'apple', 'Sources', 'ExpoModulesJSI-Cxx', 'include', 'HostFunctionClosure.h');
if (fs.existsSync(hostFnHeader)) {
  let fnContent = fs.readFileSync(hostFnHeader, 'utf8');
  if (!fnContent.includes('static inline HostFunctionClosure *create')) {
    fnContent = fnContent.replace(
      'explicit HostFunctionClosure(Context context, Closure closure, Deallocator deallocator)',
      `static inline HostFunctionClosure *create(Context context, Closure closure, Deallocator deallocator) {
    return new HostFunctionClosure(context, closure, deallocator);
  }

  explicit HostFunctionClosure(Context context, Closure closure, Deallocator deallocator)`
    );
    fs.writeFileSync(hostFnHeader, fnContent, 'utf8');
    console.log('Successfully patched HostFunctionClosure.h for Swift 6.0.');
  }
}

// 7. Patch JavaScriptRuntime.swift for Swift 6.0 compatibility
const jsRuntimeSwift = path.join(nodeModules, 'expo-modules-jsi', 'apple', 'Sources', 'ExpoModulesJSI', 'Runtime', 'JavaScriptRuntime.swift');
if (fs.existsSync(jsRuntimeSwift)) {
  let rtContent = fs.readFileSync(jsRuntimeSwift, 'utf8');
  let changed = false;
  const oldLoop = /for propertyName in propertyNames \{[\s\S]*?vector\.push_back\((?:consuming:\s*)?propNameId\)\s*\}/;
  if (oldLoop.test(rtContent)) {
    rtContent = rtContent.replace(
      oldLoop,
      `for propertyName in propertyNames {
        expo.HostObjectCallbacks.addPropNameId(&vector, iRuntime, std.string(propertyName))
      }`
    );
    changed = true;
  }
  if (rtContent.includes('return expo.HostFunctionClosure(context, call, deallocate)')) {
    rtContent = rtContent.replace(/return expo\.HostFunctionClosure\(context, call, deallocate\)/g, 'return expo.HostFunctionClosure.create(context, call, deallocate)');
    changed = true;
  }
  if (rtContent.includes('let nativeConstructor = createFunction(name) { this, arguments in')) {
    rtContent = rtContent.replace(
      'let nativeConstructor = createFunction(name) { this, arguments in',
      'let nativeConstructor = createFunction(name) { (this: JavaScriptValue, arguments: JavaScriptValuesBuffer) in'
    );
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(jsRuntimeSwift, rtContent, 'utf8');
    console.log('Successfully patched JavaScriptRuntime.swift for Swift 6.0.');
  }
}

// 8. Patch HostObjectCallbacks.h for C++-side PropNameID addition (avoids move-only C++ copy in Swift 6.0)
const hostObjHeader = path.join(nodeModules, 'expo-modules-jsi', 'apple', 'Sources', 'ExpoModulesJSI-Cxx', 'include', 'HostObjectCallbacks.h');
if (fs.existsSync(hostObjHeader)) {
  let hoContent = fs.readFileSync(hostObjHeader, 'utf8');
  if (!hoContent.includes('static inline void addPropNameId')) {
    hoContent = hoContent.replace(
      'using PropNameIds = std::vector<facebook::jsi::PropNameID>;',
      `using PropNameIds = std::vector<facebook::jsi::PropNameID>;
  static inline void addPropNameId(PropNameIds &vector, facebook::jsi::IRuntime &runtime, const std::string &name) {
    vector.push_back(facebook::jsi::PropNameID::forUtf8(runtime, name));
  }`
    );
    fs.writeFileSync(hostObjHeader, hoContent, 'utf8');
    console.log('Successfully patched HostObjectCallbacks.h for Swift 6.0.');
  }
}

// 9. Patch JavaScriptObject.swift for Swift 6.0 noncopyable delegating initializer bug
const jsObjectSwift = path.join(nodeModules, 'expo-modules-jsi', 'apple', 'Sources', 'ExpoModulesJSI', 'Runtime', 'Values', 'JavaScriptObject.swift');
if (fs.existsSync(jsObjectSwift)) {
  let content = fs.readFileSync(jsObjectSwift, 'utf8');
  if (content.includes('self.init(runtime, facebook.jsi.Object(runtime.pointee))')) {
    content = content.replace(
      'self.init(runtime, facebook.jsi.Object(runtime.pointee))',
      'self.runtimeHandle = runtime.handle\n    self.pointee = facebook.jsi.Object(runtime.pointee)'
    );
    fs.writeFileSync(jsObjectSwift, content, 'utf8');
    console.log('Successfully patched JavaScriptObject.swift for Swift 6.0.');
  }
}

// 10. Patch JavaScriptArray.swift for Swift 6.0 noncopyable delegating initializer bug
const jsArraySwift = path.join(nodeModules, 'expo-modules-jsi', 'apple', 'Sources', 'ExpoModulesJSI', 'Runtime', 'Values', 'JavaScriptArray.swift');
if (fs.existsSync(jsArraySwift)) {
  let content = fs.readFileSync(jsArraySwift, 'utf8');
  if (content.includes('self.init(runtime, facebook.jsi.Array(runtime.pointee, length))')) {
    content = content.replace(
      'self.init(runtime, facebook.jsi.Array(runtime.pointee, length))',
      'self.runtimeHandle = runtime.handle\n    self.pointee = facebook.jsi.Array(runtime.pointee, length)'
    );
    fs.writeFileSync(jsArraySwift, content, 'utf8');
    console.log('Successfully patched JavaScriptArray.swift for Swift 6.0.');
  }
}

// 11. Patch JavaScriptPromise.swift for Swift 6.0 noncopyable delegating initializer bug
const jsPromiseSwift = path.join(nodeModules, 'expo-modules-jsi', 'apple', 'Sources', 'ExpoModulesJSI', 'Runtime', 'Values', 'JavaScriptPromise.swift');
if (fs.existsSync(jsPromiseSwift)) {
  let content = fs.readFileSync(jsPromiseSwift, 'utf8');
  if (content.includes('try self.init(runtime, JavaScriptObject(runtime, object))')) {
    content = content.replace(
      'try self.init(runtime, JavaScriptObject(runtime, object))',
      `let jsObject = JavaScriptObject(runtime, object)
    self.scheduler = runtime.scheduler
    _ = try jsObject.getPropertyAsFunction(.cached(runtime, "then"))
    longLivedState.object = jsObject.asValue()
    runtime.longLivedObjects.add(longLivedState)`
    );
    fs.writeFileSync(jsPromiseSwift, content, 'utf8');
    console.log('Successfully patched JavaScriptPromise.swift for Swift 6.0.');
  }
}

console.log('Swift 6.0 compatibility patches applied successfully.');
