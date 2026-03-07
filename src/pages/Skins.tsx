import React, { useEffect, useRef, useState } from 'react';
import { SkinViewer, WalkingAnimation, IdleAnimation } from 'skinview3d';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import PageContent from '../components/layout/PageContent';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, Trash2, Pencil, Pause, Play, X, AlertTriangle, Loader2, User, Shirt, Crown } from 'lucide-react';

const SkinPreview3D = ({ src, className, model = 'classic' }: { src?: any; className?: string; model?: string }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !src) return;

        let viewer;
        try {
            viewer = new SkinViewer({
                canvas: canvasRef.current,
                width: 300,
                height: 400,
                skin: src
            });
            viewer.model = model?.toLowerCase() === 'slim' ? 'slim' : 'classic';
            viewer.zoom = 0.85;
            viewer.fov = 70;
            viewer.autoRotate = false;
            viewer.renderer.setPixelRatio(window.devicePixelRatio);

            viewer.playerObject.rotation.y = 0.5;

            viewerRef.current = viewer;

            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) {
                        viewer.setSize(width, height);
                    }
                }
            });

            if (containerRef.current) {
                resizeObserver.observe(containerRef.current);
            }

            return () => {
                resizeObserver.disconnect();
                if (viewer) viewer.dispose();
            };
        } catch (e) {
            console.error("Failed to render 3D preview", e);
        }
    }, [src, model]);

    return (
        <div ref={containerRef} className={`w-full h-full min-h-0 ${className}`}>
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
};

const SkinPreview = ({ src, className, model = 'classic' }: { src?: any; className?: string; model?: string }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas || !src) return;
            const ctx = canvas.getContext('2d');
            const scale = 8;
            canvas.width = 16 * scale;
            canvas.height = 32 * scale;
            ctx.imageSmoothingEnabled = false;

            const img = new Image();
            img.src = src;
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const isSlim = model === 'slim';
                const armWidth = isSlim ? 3 : 4;
                const drawPart = (sx, sy, sw, sh, dx, dy, dw, dh, shadow = false) => {
                    if (shadow) {
                        ctx.fillStyle = 'rgba(0,0,0,0.15)';
                        ctx.fillRect(dx * scale, (dy + 0.5) * scale, dw * scale, dh * scale);
                    }
                    ctx.drawImage(img, sx, sy, sw, sh, dx * scale, dy * scale, dw * scale, dh * scale);
                };
                drawPart(4, 20, 4, 12, 4, 20, 4, 12);

                if (img.height === 64) drawPart(20, 52, 4, 12, 8, 20, 4, 12);
                else {
                    ctx.save();
                    ctx.scale(-1, 1);
                    drawPart(4, 20, 4, 12, -12, 20, 4, 12);
                    ctx.restore();
                }
                drawPart(20, 20, 8, 12, 4, 8, 8, 12);
                drawPart(44, 20, armWidth, 12, 4 - armWidth, 8, armWidth, 12);

                if (img.height === 64) drawPart(36, 52, armWidth, 12, 12, 8, armWidth, 12);
                else {
                    ctx.save();
                    ctx.scale(-1, 1);
                    drawPart(44, 20, 4, 12, -16, 8, 4, 12);
                    ctx.restore();
                }
                drawPart(8, 8, 8, 8, 4, 0, 8, 8, true);
                if (img.height === 64) {

                    drawPart(4, 36, 4, 12, 4, 20, 4, 12);
                    drawPart(4, 52, 4, 12, 8, 20, 4, 12);

                    drawPart(20, 36, 8, 12, 4, 8, 8, 12);

                    drawPart(44, 36, armWidth, 12, 4 - armWidth, 8, armWidth, 12);
                    drawPart(52, 52, armWidth, 12, 12, 8, armWidth, 12);
                }

                drawPart(40, 8, 8, 8, 4, 0, 8, 8);
            };
        };
        render();
    }, [src, model]);

    return <canvas ref={canvasRef} className={`w-full h-full object-contain image-pixelated ${className}`} />;
};

const CapePreview = ({ src, className }: { src?: any; className?: string }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas || !src) return;
            const ctx = canvas.getContext('2d');

            const scale = 8;
            canvas.width = 10 * scale;
            canvas.height = 16 * scale;
            ctx.imageSmoothingEnabled = false;

            const img = new Image();
            img.src = src;
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const s = img.width / 64;
                ctx.drawImage(img, 1 * s, 1 * s, 10 * s, 16 * s, 0, 0, 10 * scale, 16 * scale);
            };
        };
        render();
    }, [src]);

    return <canvas ref={canvasRef} className={`w-full h-full object-contain image-pixelated ${className}`} />;
};

function Skins({ onLogout, onProfileUpdate }) {
    const { t } = useTranslation();
    const { addNotification } = useNotification();
    const canvasRef = useRef(null);
    const skinViewerRef = useRef(null);
    const [currentSkinUrl, setCurrentSkinUrl] = useState(null);
    const [localSkins, setLocalSkins] = useState([]);
    const [pendingSkin, setPendingSkin] = useState(null);

    const [variant, setVariant] = useState('classic');
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSkinLoaded, setIsSkinLoaded] = useState(false);

    const [editingSkinId, setEditingSkinId] = useState(null);
    const [editName, setEditName] = useState('');

    const [userProfile, setUserProfile] = useState(null);

    const [capes, setCapes] = useState([]);
    const [activeCapeId, setActiveCapeId] = useState(null);
    const [originalVariant, setOriginalVariant] = useState('classic');
    const [showCapeModal, setShowCapeModal] = useState(false);
    const [webglError, setWebglError] = useState(false);

    const isWebGLSupported = () => {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    };

    useEffect(() => {
        if (!canvasRef.current) return;

        if (!isWebGLSupported()) {
            console.error("WebGL is not supported or context could not be created.");
            setWebglError(true);
            return;
        }

        let viewer;
        try {
            viewer = new SkinViewer({
                canvas: canvasRef.current,
                width: 300,
                height: 400,
                skin: null
            });

            viewer.fov = 70;
            viewer.zoom = 0.9;
            viewer.animation = new IdleAnimation();
            viewer.autoRotate = false;
            viewer.autoRotateSpeed = 0.5;
            if (canvasRef.current) {
                canvasRef.current.style.imageRendering = "pixelated";
            }
            viewer.renderer.setPixelRatio(window.devicePixelRatio);

            skinViewerRef.current = viewer;

            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) {
                        viewer.setSize(width, height);
                    }
                }
            });

            const container = canvasRef.current.parentElement;
            if (container) {
                resizeObserver.observe(container);
            }

            return () => {
                resizeObserver.disconnect();
                if (viewer) {
                    viewer.dispose();
                }
            };
        } catch (e) {
            console.error("Failed to initialize SkinViewer:", e);
            setWebglError(true);
        }
    }, []);
    useEffect(() => {
        loadProfileAndSkin();
        loadLocalSkins();

        window.electronAPI.getSettings().then(res => {
            if (res.success) {
                if (res.settings.focusMode) setIsAnimating(false);
                if (res.settings.lowGraphicsMode) setWebglError(true);
            }
        });
    }, []);
    useEffect(() => {
    }, []);
    useEffect(() => {
        if (skinViewerRef.current) {
            skinViewerRef.current.animation = isAnimating ? new WalkingAnimation() : new IdleAnimation();
        }
    }, [isAnimating]);

    const updateSkinInViewer = async (url, model) => {
        if (!skinViewerRef.current) return;
        try {
            await skinViewerRef.current.loadSkin(url, { model: model?.toLowerCase() || 'classic' });
            ["head", "body", "rightArm", "leftArm", "rightLeg", "leftLeg"].forEach(part => {
                if (skinViewerRef.current.playerObject.skin[part]) {
                    skinViewerRef.current.playerObject.skin[part].innerLayer.visible = true;
                    skinViewerRef.current.playerObject.skin[part].outerLayer.visible = true;
                }
            });
            const activeCape = capes.find(c => c.id === activeCapeId);
            if (activeCape) skinViewerRef.current.loadCape(activeCape.url);

            setIsSkinLoaded(true);
        } catch (e) {
            console.error("Failed to update skin viewer", e);
        }
    }

    const loadProfileAndSkin = async () => {
        setIsLoading(true);
        try {
            if (!window.electronAPI?.getProfile) return;
            if (window.electronAPI.validateSession) {
                const val = await window.electronAPI.validateSession();
                if (!val.success) {
                    if (onLogout) onLogout();
                    else setUserProfile(null);
                    setIsLoading(false);
                    return;
                }
            }

            const profile = await window.electronAPI.getProfile();
            if (profile && profile.access_token && window.electronAPI.getCurrentSkin) {
                try {
                    const res = await window.electronAPI.getCurrentSkin(profile.access_token);
                    if (res.success) {
                        const skinUrl = res.url;
                        const model = (res.variant || 'classic').toLowerCase();

                        profile.skinUrl = skinUrl;
                        setCurrentSkinUrl(skinUrl);
                        setVariant(model);
                        setOriginalVariant(model);
                        setCapes(res.capes || []);

                        const activeCape = (res.capes || []).find(c => c.state === 'ACTIVE');
                        setActiveCapeId(activeCape ? activeCape.id : null);

                        await updateSkinInViewer(skinUrl, model);
                    } else {
                        if (res.authError) {
                            addNotification(t('login.failed') + '. ' + t('common.restart_app'), 'error');
                            if (onLogout) onLogout();
                            return;
                        }
                        addNotification(t('skins.upload_failed', { error: res.error }), 'info');
                        setIsSkinLoaded(true);
                    }
                } catch (e) {
                    console.error("Failed to load skin", e);
                    addNotification(t('skins.upload_failed', { error: 'Mojang' }), 'error');
                }
            }

            setUserProfile(profile);
            if (onProfileUpdate) onProfileUpdate(profile);
        } catch (e) {
            console.error("Failed to load profile/skin", e);
            addNotification(t('skins.upload_failed', { error: t('common.error_title') }), 'error');
        }
        setIsLoading(false);
    };

    const loadLocalSkins = async () => {
        try {
            if (!window.electronAPI?.getLocalSkins) return;
            const skins = await window.electronAPI.getLocalSkins();
            setLocalSkins(skins || []);
        } catch (e) {
            console.error("Failed to load local skins", e);
        }
    };

    const handleImportSkin = async () => {
        if (!window.electronAPI?.saveLocalSkin) return;
        try {
            const res = await window.electronAPI.saveLocalSkin();
            if (res.success) {
                addNotification(t('skins.import_success'), 'success');
                loadLocalSkins();
            } else if (res.error !== 'Cancelled') {
                addNotification(t('skins.import_failed', { error: res.error }), 'error');
            }
        } catch (e) {
            console.error("Import failed", e);
        }
    };

    const handleSelectLocalSkin = async (skin) => {
        setPendingSkin({ type: 'local', ...skin });
        if (skin.data) {
            await updateSkinInViewer(skin.data, variant);
        }
    };

    const handleSelectDefaultSkin = async (name) => {
        const url = name === 'Steve'
            ? "https://textures.minecraft.net/texture/1a4af718455d4aab528e7a61f86fa25e6a369d1768dcb13f7df319a713eb810b"
            : "https://textures.minecraft.net/texture/3b60a1f6d562f52aaebbf1434f1de147933a3affe0e764fa49ea057536623cd3";
        const model = name === 'Steve' ? 'classic' : 'slim';

        setPendingSkin({ type: 'url', url, model, name });
        setVariant(model);

        await updateSkinInViewer(url, model);
    };

    const handleApplySkin = async () => {
        if (!pendingSkin && variant === originalVariant) return;
        if (!userProfile) {
            addNotification(t('skins.upload_failed', { error: 'Auth' }), 'error');
            return;
        }

        setIsLoading(true);
        let res;

        try {
            if (pendingSkin) {
                if (pendingSkin.type === 'local') {
                    res = await window.electronAPI.uploadSkin(userProfile.access_token, pendingSkin.path, variant);
                } else if (pendingSkin.type === 'url') {
                    res = await window.electronAPI.uploadSkinFromUrl(userProfile.access_token, pendingSkin.url, variant);
                }
            } else if (variant !== originalVariant && currentSkinUrl) {
                res = await window.electronAPI.uploadSkinFromUrl(userProfile.access_token, currentSkinUrl, variant);
            }

            if (res.success) {
                addNotification(t('skins.upload_success'), 'success');
                setPendingSkin(null);

                loadProfileAndSkin();
            } else {
                addNotification(t('skins.upload_failed', { error: res.error }), 'error');
            }
        } catch (e) {
            console.error(e);
            addNotification(t('skins.upload_failed', { error: e.message }), 'error');
        }

        setIsLoading(false);
    };

    const handleSetCape = async (capeId) => {
        if (!userProfile) return;
        setIsLoading(true);
        const res = await window.electronAPI.setCape(userProfile.access_token, capeId);
        setIsLoading(false);

        if (res.success) {
            const cape = capes.find(c => c.id === capeId);
            setActiveCapeId(capeId);
            if (skinViewerRef.current) {
                skinViewerRef.current.loadCape(cape ? cape.url : null);
            }
            setShowCapeModal(false);
            addNotification(capeId ? t('skins.cape_activated') : t('skins.cape_removed'), 'success');
        } else {
            addNotification(t('skins.upload_failed', { error: res.error }), 'error');
        }
    };

    const handleDeleteSkin = async (e, id) => {
        e.stopPropagation();
        const res = await window.electronAPI.deleteLocalSkin(id);
        if (res.success) {
            addNotification(t('skins.delete_success'), 'info');
            if (pendingSkin?.id === id) {
                setPendingSkin(null);

                if (skinViewerRef.current && currentSkinUrl) {
                    await updateSkinInViewer(currentSkinUrl, variant);
                }
            }
            loadLocalSkins();
        } else {
            addNotification(t('skins.delete_failed', { error: res.error }), 'error');
        }
    };

    const handleRename = async (id) => {
        if (!editName.trim()) {
            setEditingSkinId(null);
            return;
        }
        const res = await window.electronAPI.renameLocalSkin(id, editName);
        if (res.success) {
            addNotification(t('skins.rename_success'), 'success');
            loadLocalSkins();
        } else {
            addNotification(t('skins.rename_failed', { error: res.error }), 'error');
        }
        setEditingSkinId(null);
    };

    return (
        <TooltipProvider>
            <div className="h-full flex overflow-hidden relative">
                <Dialog open={showCapeModal} onOpenChange={setShowCapeModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{t('skins.select_cape')}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                            <div
                                onClick={() => handleSetCape(null)}
                                className={`aspect-[3/4] rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${activeCapeId === null ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground/50 bg-muted/50'}`}
                            >
                                <X className="h-6 w-6 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium text-muted-foreground">{t('skins.no_cape')}</span>
                            </div>

                            {capes.map(cape => (
                                <div
                                    key={cape.id}
                                    onClick={() => handleSetCape(cape.id)}
                                    className={`aspect-[3/4] rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${activeCapeId === cape.id ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground/50 bg-muted/50'}`}
                                >
                                    <div className="h-1/2 w-full p-2 flex items-center justify-center">
                                        <CapePreview src={cape.url} />
                                    </div>
                                    <span className="text-sm font-medium text-foreground text-center px-2">{cape.alias}</span>
                                    {activeCapeId === cape.id && (
                                        <Badge className="absolute top-2 right-2" variant="default">
                                            {t('skins.active')}
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="w-1/3 min-w-[300px] bg-card/50 backdrop-blur-sm border-r border-border flex flex-col items-center justify-center relative p-6">
                    <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
                            {t('common.beta')}
                        </Badge>
                    </div>

                    <div className="absolute top-4 right-4">
                        <span className="text-sm font-semibold text-foreground">
                            {userProfile?.name || t('skins.guest')}
                        </span>
                    </div>

                    <div className={`relative w-full h-[400px] flex items-center justify-center transition-opacity duration-300 ${isSkinLoaded || webglError ? 'opacity-100' : 'opacity-0'}`}>
                        {webglError ? (
                            <div className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-12 h-12 bg-destructive/15 text-destructive rounded-xl flex items-center justify-center mb-4">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground mb-1">{t('common.error_title')}</h3>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    {t('skins.webgl_error') || "3D Preview is not available on your system. You can still manage your skins using the 2D previews below."}
                                </p>
                            </div>
                        ) : (
                            <canvas ref={canvasRef} className="cursor-move outline-none" />
                        )}
                    </div>

                    {!isSkinLoaded && !webglError && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                    )}

                    <div className="absolute bottom-6 flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsAnimating(!isAnimating)}
                                >
                                    {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isAnimating ? t('skins.pause') : t('skins.play')}
                            </TooltipContent>
                        </Tooltip>

                        <Separator orientation="vertical" className="h-6" />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const newVariant = variant === 'classic' ? 'slim' : 'classic';
                                setVariant(newVariant);

                                const url = pendingSkin?.url || pendingSkin?.data || currentSkinUrl;
                                if (skinViewerRef.current && url) {
                                    updateSkinInViewer(url, newVariant);
                                }
                            }}
                        >
                            <User className="h-4 w-4" />
                            {t('skins.model')}: {variant === 'classic' ? `(${t('skins.wide')})` : `(${t('skins.slim')})`}
                        </Button>

                        <Separator orientation="vertical" className="h-6" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCapeModal(true)}
                                    disabled={!capes.length}
                                >
                                    <Crown className="h-4 w-4" />
                                    {capes.length ? t('skins.change_cape') : t('skins.no_capes')}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {capes.length ? t('skins.change_cape') : t('skins.no_capes')}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                        <div className="min-w-0">
                            <h1 className="text-lg font-semibold text-foreground tracking-tight">{t('skins.title')}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">{t('skins.desc')}</p>
                        </div>
                        {(pendingSkin || (variant !== originalVariant && currentSkinUrl)) && (
                            <Button
                                onClick={handleApplySkin}
                                disabled={isLoading}
                                size="sm"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isLoading ? t('skins.uploading') : t('skins.apply')}
                            </Button>
                        )}
                    </div>

                    <PageContent>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('skins.saved_skins')}</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                <div
                                    onClick={handleImportSkin}
                                    className="aspect-[3/4] bg-muted/50 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/15 transition-colors">
                                        <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{t('skins.add_skin')}</span>
                                </div>

                                {localSkins.map((skin) => (
                                    <div
                                        key={skin.id}
                                        onClick={() => handleSelectLocalSkin(skin)}
                                        className={`aspect-[3/4] bg-card rounded-lg overflow-hidden relative cursor-pointer border-2 transition-all group ${pendingSkin?.id === skin.id ? 'border-primary ring-1 ring-primary/25' : 'border-transparent hover:border-border'}`}
                                    >
                                        <div className="p-3 flex items-center justify-center h-full bg-muted/30">
                                            {!webglError ? (
                                                <SkinPreview3D src={skin.data || `file://${skin.path}`} />
                                            ) : (
                                                <SkinPreview src={skin.data || `file://${skin.path}`} />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex items-center gap-1">
                                                {editingSkinId === skin.id ? (
                                                    <Input
                                                        autoFocus
                                                        className="h-6 text-xs px-1.5 bg-background/80 border-primary"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleRename(skin.id);
                                                            if (e.key === 'Escape') setEditingSkinId(null);
                                                        }}
                                                        onBlur={() => handleRename(skin.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <>
                                                        <span
                                                            className="text-foreground text-xs font-medium truncate flex-1 cursor-text"
                                                            onDoubleClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingSkinId(skin.id);
                                                                setEditName(skin.name);
                                                            }}
                                                        >
                                                            {skin.name}
                                                        </span>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-5 w-5 shrink-0"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingSkinId(skin.id);
                                                                        setEditName(skin.name);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-3 w-3" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Rename</TooltipContent>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => handleDeleteSkin(e, skin.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete</TooltipContent>
                                        </Tooltip>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator className="my-5" />

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('skins.default_skins')}</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {[
                                    { name: 'Steve', url: 'https://textures.minecraft.net/texture/1a4af718455d4aab528e7a61f86fa25e6a369d1768dcb13f7df319a713eb810b', model: 'classic' },
                                    { name: 'Alex', url: 'https://textures.minecraft.net/texture/3b60a1f6d562f52aaebbf1434f1de147933a3affe0e764fa49ea057536623cd3', model: 'slim' }
                                ].map(skin => (
                                    <div
                                        key={skin.name}
                                        onClick={() => handleSelectDefaultSkin(skin.name)}
                                        className={`aspect-[3/4] bg-card rounded-lg overflow-hidden relative cursor-pointer border-2 transition-all group ${pendingSkin?.name === skin.name ? 'border-primary ring-1 ring-primary/25' : 'border-transparent hover:border-border'}`}
                                    >
                                        <div className="p-3 flex items-center justify-center h-full bg-muted/30">
                                            {!webglError ? (
                                                <SkinPreview3D src={skin.url} model={skin.model} />
                                            ) : (
                                                <SkinPreview src={skin.url} model={skin.model} />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-foreground text-xs font-medium truncate">
                                                {skin.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </PageContent>
                </div>
            </div>
        </TooltipProvider>
    );
}

export default Skins;
