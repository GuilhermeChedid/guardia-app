const { withProjectBuildGradle } = require('@expo/config-plugins');

const JVM_TARGET = `
subprojects {
    if (name == "expo-dynamic-app-icon") {
        tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
            kotlinOptions {
                jvmTarget = JavaVersion.VERSION_17.majorVersion
            }
        }
        afterEvaluate {
            android {
                compileOptions {
                    sourceCompatibility JavaVersion.VERSION_17
                    targetCompatibility JavaVersion.VERSION_17
                }
            }
        }
    }
}
`;

module.exports = function withDynamicAppIconJvmTarget(config) {
    return withProjectBuildGradle(config, (config) => {
        if (config.modResults.language !== 'groovy') {
            throw new Error(
                'withDynamicAppIconJvmTarget requer o build.gradle em Groovy.'
            );
        }

        if (!config.modResults.contents.includes('expo-dynamic-app-icon')) {
            config.modResults.contents += JVM_TARGET;
        }

        return config;
    });
};
