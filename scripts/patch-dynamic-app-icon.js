const fs = require('fs');
const path = require('path');

const modulePath = path.resolve(
    __dirname,
    '../node_modules/expo-dynamic-app-icon/android/src/main/java/expo/modules/dynamicappicon/ExpoDynamicAppIconModule.kt',
);

if (!fs.existsSync(modulePath)) {
    console.warn(`expo-dynamic-app-icon não encontrado em ${modulePath}; patch ignorado.`);
    process.exit(0);
}

const source = fs.readFileSync(modulePath, 'utf8');
const startMarker = '    Function("setAppIcon") { name: String ->';
const endMarker = '\n    Function("getAppIcon") {';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);

if (start === -1 || end === -1) {
    throw new Error('Não foi possível localizar a função setAppIcon do expo-dynamic-app-icon.');
}

const patchedFunction = `    Function("setAppIcon") { name: String ->
      try {
        val aliases = listOf("guardia", "calculator", "guide", "files")
        val newIcon = context.packageName + ".MainActivity" + name

        SharedObject.packageName = context.packageName
        SharedObject.pm = pm

        pm.setComponentEnabledSetting(
          ComponentName(context.packageName, newIcon),
          PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
          PackageManager.DONT_KILL_APP
        )

        aliases
          .filter { alias -> alias != name }
          .map { alias -> context.packageName + ".MainActivity" + alias }
          .forEach { alias -> SharedObject.classesToKill.add(alias) }

        SharedObject.icon = newIcon
        return@Function name
      } catch (e: Exception) {
        return@Function false
      }

      return@Function false
    }
`;

const nextSource = `${source.slice(0, start)}${patchedFunction}${source.slice(end + 1)}`;
if (nextSource !== source) {
    fs.writeFileSync(modulePath, nextSource);
    console.log('expo-dynamic-app-icon patched successfully.');
} else {
    console.log('expo-dynamic-app-icon já estava corrigido.');
}
