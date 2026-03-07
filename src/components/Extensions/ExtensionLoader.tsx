import React, { useEffect, useState } from 'react';

const ExtensionLoader = ({ extensionPath, ...props }: { extensionPath: string; [key: string]: any }) => {
    const [Component, setComponent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadExtension = async () => {
            try {
                const importUrl = `app-media:///${extensionPath}`;
                const response = await fetch(importUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch extension: ${response.statusText}`);
                }
                const code = await response.text();
                const customRequire = (moduleName) => {
                    if (moduleName === 'react') return window.React;
                    if (moduleName === 'react-dom') return window.ReactDOM;
                    if (moduleName === 'react-dom/client') return window.ReactDOM;

                    throw new Error(`Cannot find module '${moduleName}'`);
                };

                const exports: any = {};
                const module: any = { exports };
                const wrapper = new Function('require', 'exports', 'module', 'React', code);
                wrapper(customRequire, exports, module, window.React);
                const ExportedComponent = module.exports.default || module.exports;

                if (ExportedComponent) {
                    setComponent(() => ExportedComponent);
                } else {
                    throw new Error("Extension did not export a default component");
                }
            } catch (err: any) {
                console.error("Failed to load extension:", err);
                setError(err.message);
            }
        };

        if (extensionPath) {
            loadExtension();
        }
    }, [extensionPath]);

    if (error) {
        return <div className="p-4 text-red-500 bg-red-900/20 rounded">Failed to load extension: {error}</div>;
    }

    if (!Component) {
        return <div className="p-4 text-muted-foreground">Loading extension...</div>;
    }

    return <Component {...props} />;
};

export default ExtensionLoader;