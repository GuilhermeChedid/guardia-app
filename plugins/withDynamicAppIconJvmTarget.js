const { withAndroidManifest, withProjectBuildGradle } = require('@expo/config-plugins');

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
    config = withAndroidManifest(config, (config) => {
        const application = config.modResults.manifest.application?.[0];
        if (!application) return config;

        application.activity = (application.activity || []).map((activity) => {
            if (activity.$?.['android:name'] !== '.MainActivity') return activity;
            activity['intent-filter'] = (activity['intent-filter'] || []).filter((filter) => {
                const actions = filter.action || [];
                const categories = filter.category || [];
                return !actions.some((action) => action.$?.['android:name'] === 'android.intent.action.MAIN') ||
                    !categories.some((category) => category.$?.['android:name'] === 'android.intent.category.LAUNCHER');
            });
            return activity;
        });

        application['activity-alias'] = (application['activity-alias'] || []).map((alias) => {
            const name = alias.$?.['android:name'] || '';
            if (name.endsWith('MainActivityguardia')) {
                alias.$['android:enabled'] = 'true';
            }
            return alias;
        });
        return config;
    });

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
