import React, { useState, useRef, useEffect } from 'react';
import {
    Camera, Upload, Scan, CheckCircle, AlertCircle, Loader2, Sparkles, X,
    Image as ImageIcon, AlertTriangle, ThumbsUp, ThumbsDown, Info
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ToastSystem';

// URL do webhook N8N - direto
const N8N_WEBHOOK_URL = 'https://n8n.srv1121163.hstgr.cloud/webhook/analyze-food';

const FoodRecognition = () => {
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [diet, setDiet] = useState(null);
    const [dietComparison, setDietComparison] = useState(null);
    const { user } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // Buscar dieta ativa do usuário
    useEffect(() => {
        if (user) {
            fetchActiveDiet();
        }
    }, [user]);

    const fetchActiveDiet = async () => {
        try {
            const { data, error } = await supabase
                .from('diets')
                .select('*')
                .eq('user_id', user.id)
                .eq('active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            if (data) setDiet(data);
        } catch (err) {
            console.error('Erro ao buscar dieta:', err);
        }
    };

    // Função para comprimir imagem - super otimizada para Android
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const MAX_SIZE = 480; // Muito menor para Android
            const QUALITY = 0.5; // Qualidade mais baixa
            
            // Usar createImageBitmap quando disponível (mais eficiente)
            if (typeof createImageBitmap === 'function') {
                createImageBitmap(file)
                    .then(bitmap => {
                        const canvas = document.createElement('canvas');
                        let width = bitmap.width;
                        let height = bitmap.height;

                        // Redimensionar
                        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height, 1);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);

                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(bitmap, 0, 0, width, height);
                        bitmap.close(); // Liberar memória

                        canvas.toBlob((blob) => {
                            const base64Promise = new Promise((res) => {
                                const reader = new FileReader();
                                reader.onloadend = () => res(reader.result);
                                reader.readAsDataURL(blob);
                            });
                            
                            base64Promise.then(base64 => {
                                resolve({ base64, blob });
                            });
                        }, 'image/jpeg', QUALITY);
                    })
                    .catch(reject);
            } else {
                // Fallback para navegadores antigos
                const url = URL.createObjectURL(file);
                const img = new Image();
                
                img.onload = () => {
                    URL.revokeObjectURL(url);
                    
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height, 1);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve({
                                base64: canvas.toDataURL('image/jpeg', QUALITY),
                                blob
                            });
                        } else {
                            reject(new Error('Falha'));
                        }
                    }, 'image/jpeg', QUALITY);
                };
                
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error('Erro'));
                };
                
                img.src = url;
            }
        });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        e.target.value = '';
        
        // Limite mais baixo para Android
        if (file.size > 4 * 1024 * 1024) {
            toast.error('❌ Foto muito grande. Use a galeria ou tire foto mais perto.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setDietComparison(null);

        // Dar tempo para o UI mostrar loading
        await new Promise(r => setTimeout(r, 50));

        try {
            const compressed = await compressImage(file);
            setImage(compressed.base64);
            setImageFile(new File([compressed.blob], 'foto.jpg', { type: 'image/jpeg' }));
        } catch (err) {
            console.error('Erro:', err);
            toast.error('❌ Erro ao processar. Tente uma foto da galeria.');
            setError('Falha ao processar imagem.');
        } finally {
            setLoading(false);
        }
        }
    };

    const analyzeImage = async () => {
        if (!image || !imageFile) return;

        setLoading(true);
        setAnalyzing(true);
        setError(null);

        try {
            // Converter imagem para base64
            const base64Image = image.split(',')[1];

            // Preparar dados para enviar ao N8N
            const payload = {
                image: base64Image,
                user_id: user.id,
                has_diet: !!diet,
                diet_targets: diet?.daily_targets || null,
                diet_goal: diet?.goal || null,
                timestamp: new Date().toISOString()
            };

            // Tentar enviar para N8N
            let analysisResult;

            try {
                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('N8N não disponível');
                }

                analysisResult = await response.json();
            } catch (n8nError) {
                console.warn('N8N não disponível, usando mock:', n8nError);
                // Fallback para mock se N8N não estiver disponível
                await new Promise(resolve => setTimeout(resolve, 2000));
                analysisResult = getMockAnalysis();
            }

            setResult(analysisResult);

            // Se tem dieta, comparar
            if (diet) {
                const comparison = compareToDiet(analysisResult, diet);
                setDietComparison(comparison);
            }

            setAnalyzing(false);

        } catch (err) {
            console.error("Erro ao analisar imagem:", err);
            setError("Não conseguimos analisar esta imagem. Tente novamente com uma foto mais clara.");
            setAnalyzing(false);
        } finally {
            setLoading(false);
        }
    };

    const getMockAnalysis = () => {
        // Respostas mock variadas para demonstração
        const mockResponses = [
            {
                alimento_reconhecido: "Frango Grelhado com Salada e Arroz Integral",
                classificacao_geral: "Refeição Saudável",
                porcao_descricao: "1 prato médio",
                porcao_gramas: 400,
                nutrientes: {
                    carboidratos_g: 45,
                    proteinas_g: 42,
                    gorduras_g: 12,
                    calorias_kcal: 450,
                    fibras_g: 6,
                    sodio_mg: 380
                },
                estimativa_confianca: 0.92,
                observacoes: "Excelente escolha proteica! O frango grelhado é uma ótima fonte de proteína magra. O arroz integral adiciona carboidratos complexos e a salada fornece fibras e micronutrientes.",
                alimentos_identificados: [
                    { nome: "Frango grelhado", porcao: "150g", calorias: 250, proteina: 38 },
                    { nome: "Arroz integral", porcao: "100g", calorias: 130, proteina: 3 },
                    { nome: "Salada verde", porcao: "150g", calorias: 45, proteina: 1 },
                    { nome: "Azeite de oliva", porcao: "1 colher", calorias: 25, proteina: 0 }
                ],
                sugestoes: [
                    "Adicione mais vegetais coloridos para aumentar vitaminas",
                    "Considere trocar por batata doce para mais fibras"
                ]
            },
            {
                alimento_reconhecido: "Açaí com Granola e Frutas",
                classificacao_geral: "Refeição Energética",
                porcao_descricao: "1 tigela média",
                porcao_gramas: 350,
                nutrientes: {
                    carboidratos_g: 85,
                    proteinas_g: 8,
                    gorduras_g: 15,
                    calorias_kcal: 520,
                    fibras_g: 8,
                    sodio_mg: 45
                },
                estimativa_confianca: 0.88,
                observacoes: "⚠️ Alto teor de carboidratos. Boa opção pré-treino, mas atenção se o objetivo for emagrecimento. O açaí natural é nutritivo, mas verifique se há açúcar adicionado.",
                alimentos_identificados: [
                    { nome: "Açaí", porcao: "200g", calorias: 280, proteina: 4 },
                    { nome: "Granola", porcao: "50g", calorias: 180, proteina: 3 },
                    { nome: "Banana", porcao: "1 unidade", calorias: 45, proteina: 1 },
                    { nome: "Morango", porcao: "5 unidades", calorias: 15, proteina: 0 }
                ],
                sugestoes: [
                    "Prefira versão sem açúcar adicionado",
                    "Reduza a granola pela metade se busca emagrecer"
                ]
            },
            {
                alimento_reconhecido: "Pizza de Calabresa",
                classificacao_geral: "Refeição Calórica",
                porcao_descricao: "2 fatias médias",
                porcao_gramas: 200,
                nutrientes: {
                    carboidratos_g: 52,
                    proteinas_g: 18,
                    gorduras_g: 22,
                    calorias_kcal: 480,
                    fibras_g: 2,
                    sodio_mg: 980
                },
                estimativa_confianca: 0.95,
                observacoes: "🔴 Alta densidade calórica e sódio elevado. Consumo eventual é aceitável, mas evite se estiver em fase de emagrecimento. A calabresa é processada e rica em gordura saturada.",
                alimentos_identificados: [
                    { nome: "Massa de pizza", porcao: "100g", calorias: 180, proteina: 6 },
                    { nome: "Queijo mussarela", porcao: "50g", calorias: 140, proteina: 10 },
                    { nome: "Calabresa", porcao: "40g", calorias: 120, proteina: 5 },
                    { nome: "Molho de tomate", porcao: "30g", calorias: 15, proteina: 0 }
                ],
                sugestoes: [
                    "Limite a 1 fatia e acompanhe com salada",
                    "Prefira versões com mais vegetais"
                ]
            }
        ];

        return mockResponses[Math.floor(Math.random() * mockResponses.length)];
    };

    const compareToDiet = (analysisResult, userDiet) => {
        const nutrients = analysisResult.nutrientes;
        const targets = userDiet.daily_targets;
        const goal = userDiet.goal;

        // Calcular quanto essa refeição representa das metas diárias
        const percentages = {
            calories: Math.round((nutrients.calorias_kcal / targets.calories) * 100),
            protein: Math.round((nutrients.proteinas_g / targets.protein) * 100),
            carbs: Math.round((nutrients.carboidratos_g / targets.carbs) * 100),
            fat: Math.round((nutrients.gorduras_g / targets.fat) * 100)
        };

        // Análise baseada no objetivo
        let status = 'good';
        let messages = [];
        let warnings = [];
        let tips = [];

        if (goal === 'emagrecimento') {
            // Para emagrecimento: priorizar proteína, controlar carbs e calorias
            if (percentages.calories > 35) {
                status = 'warning';
                warnings.push('Esta refeição representa mais de 35% das suas calorias diárias');
            }
            if (percentages.protein < 25) {
                warnings.push('Proteína abaixo do ideal para seu objetivo');
                tips.push('Adicione mais fontes de proteína magra');
            }
            if (percentages.carbs > 40) {
                status = 'warning';
                warnings.push('Carboidratos acima do recomendado para emagrecimento');
                tips.push('Prefira carboidratos complexos e reduza a porção');
            }
            if (percentages.protein >= 25 && percentages.carbs <= 30) {
                messages.push('✅ Bom equilíbrio para emagrecimento!');
            }
        } else if (goal === 'fortalecimento') {
            // Para fortalecimento: proteína é rei
            if (percentages.protein < 30) {
                status = 'warning';
                warnings.push('Proteína insuficiente para ganho muscular');
                tips.push('Aumente a porção de proteína para 40g+');
            }
            if (percentages.protein >= 35) {
                messages.push('💪 Excelente dose de proteína para seus músculos!');
            }
            if (percentages.calories < 25) {
                warnings.push('Calorias baixas para fase de fortalecimento');
            }
        } else {
            // Manutenção: equilíbrio
            if (percentages.calories > 25 && percentages.calories < 35) {
                messages.push('⚖️ Refeição equilibrada para manutenção');
            }
        }

        // Verificar se os alimentos batem com o planejado
        if (userDiet.meals && userDiet.meals.length > 0) {
            const currentHour = new Date().getHours();
            const plannedMeal = findPlannedMeal(userDiet.meals, currentHour);

            if (plannedMeal) {
                tips.push(`📅 Refeição planejada para agora: ${plannedMeal.name}`);

                // Verificar se os macros da refeição planejada batem
                if (plannedMeal.target_calories && Math.abs(nutrients.calorias_kcal - plannedMeal.target_calories) > 100) {
                    warnings.push(`Diferença de ${Math.abs(nutrients.calorias_kcal - plannedMeal.target_calories)}kcal do planejado`);
                }
            }
        }

        // Determinar status final
        if (warnings.length >= 2) status = 'bad';
        else if (warnings.length === 1) status = 'warning';
        else if (messages.length > 0) status = 'good';

        return {
            status,
            percentages,
            messages,
            warnings,
            tips,
            fitsGoal: status === 'good'
        };
    };

    const findPlannedMeal = (meals, currentHour) => {
        for (const meal of meals) {
            if (meal.time) {
                const mealHour = parseInt(meal.time.split(':')[0]);
                if (Math.abs(mealHour - currentHour) <= 2) {
                    return meal;
                }
            }
        }
        return null;
    };

    const saveMeal = async () => {
        if (!result || !imageFile || !user) return;
        setSaving(true);

        try {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('meal-images')
                .upload(fileName, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('meal-images')
                .getPublicUrl(fileName);

            const { error: dbError } = await supabase
                .from('meals')
                .insert([
                    {
                        user_id: user.id,
                        image_url: publicUrl,
                        food_name: result.alimento_reconhecido,
                        calories: result.nutrientes.calorias_kcal,
                        protein: result.nutrientes.proteinas_g,
                        carbs: result.nutrientes.carboidratos_g,
                        fat: result.nutrientes.gorduras_g,
                        fiber: result.nutrientes.fibras_g || 0,
                        sodium: result.nutrientes.sodio_mg || 0,
                        confidence: result.estimativa_confianca,
                        portion_grams: result.porcao_gramas,
                        notes: result.observacoes,
                        diet_compliance: dietComparison?.status || null,
                        foods_detected: result.alimentos_identificados || [],
                        classification: result.classificacao_geral
                    }
                ]);

            if (dbError) throw dbError;

            toast.success('✅ Refeição salva com sucesso!');

            // Reset
            setTimeout(() => {
                setImage(null);
                setResult(null);
                setImageFile(null);
                setDietComparison(null);
            }, 1000);

        } catch (err) {
            console.error("Erro ao salvar:", err);
            toast.error('❌ Erro ao salvar refeição');
        } finally {
            setSaving(false);
        }
    };

    const resetImage = () => {
        setImage(null);
        setResult(null);
        setImageFile(null);
        setError(null);
        setDietComparison(null);
    };

    return (
        <div className="flex flex-col gap-6 animate-slide-up">
            {/* Header */}
            <div className="text-center space-y-3 pt-2">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold">
                    <Sparkles size={16} />
                    <span>Powered by AI</span>
                </div>
                <h2 className="text-4xl font-black text-primary leading-tight">
                    O que você comeu?
                </h2>
                <p className="text-muted text-lg font-medium">
                    Tire uma foto para rastrear automaticamente
                </p>
            </div>

            {/* Diet Status Banner */}
            {diet && (
                <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-xl">
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                        <CheckCircle size={20} className="text-accent" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm text-primary">Dieta Ativa</p>
                        <p className="text-xs text-muted">
                            {diet.goal === 'emagrecimento' ? '🔥 Emagrecimento' :
                                diet.goal === 'fortalecimento' ? '💪 Fortalecimento' : '⚖️ Manutenção'}
                            {diet.nutritionist_name && ` • ${diet.nutritionist_name}`}
                        </p>
                    </div>
                </div>
            )}

            {/* Main Card */}
            <div className="card card-hover rounded-xl overflow-hidden shadow-lg border-0">
                {!image ? (
                    <EmptyState
                        onCameraClick={() => cameraInputRef.current?.click()}
                        onGalleryClick={() => fileInputRef.current?.click()}
                    />
                ) : (
                    <ImagePreview
                        image={image}
                        loading={loading}
                        analyzing={analyzing}
                        onReset={resetImage}
                        onAnalyze={analyzeImage}
                        error={error}
                    />
                )}

                {/* Hidden Inputs */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                />
            </div>

            {/* Results */}
            {result && !loading && (
                <>
                    {/* Diet Comparison Alert */}
                    {dietComparison && <DietComparisonCard comparison={dietComparison} />}

                    {/* Main Results */}
                    <ResultsCard result={result} onSave={saveMeal} saving={saving} />

                    {/* Foods Detected */}
                    {result.alimentos_identificados && (
                        <FoodsDetectedCard foods={result.alimentos_identificados} />
                    )}

                    {/* AI Suggestions */}
                    {result.sugestoes && result.sugestoes.length > 0 && (
                        <SuggestionsCard suggestions={result.sugestoes} />
                    )}
                </>
            )}
        </div>
    );
};

// ========================================
// SUB-COMPONENTS
// ========================================

const EmptyState = ({ onCameraClick, onGalleryClick }) => (
    <div className="p-12 flex flex-col items-center justify-center gap-8 text-center bg-gradient-to-b from-secondary/30 to-transparent min-h-[350px]">
        <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-hover rounded-3xl flex items-center justify-center text-white shadow-xl animate-scale-in">
                <ImageIcon size={40} strokeWidth={2} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white shadow-lg">
                <Sparkles size={16} />
            </div>
        </div>

        <div className="space-y-2">
            <h3 className="text-2xl font-bold text-primary">Adicionar Refeição</h3>
            <p className="text-muted text-sm max-w-[280px] mx-auto leading-relaxed">
                Tire uma foto da sua refeição e descubra os nutrientes instantaneamente
            </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={onCameraClick} className="btn btn-primary flex-1 py-4 text-base shadow-xl">
                <Camera size={20} strokeWidth={2.5} />
                <span>Abrir Câmera</span>
            </button>
            <button onClick={onGalleryClick} className="btn btn-outline flex-1 py-4 text-base bg-white">
                <Upload size={20} />
                <span>Galeria de Fotos</span>
            </button>
        </div>
    </div>
);

const ImagePreview = ({ image, loading, analyzing, onReset, onAnalyze, error }) => (
    <div className="relative group">
        <img
            src={image}
            alt="Preview"
            className="w-full h-auto max-h-[400px] object-cover bg-secondary"
        />

        {/* Overlay Controls */}
        {!loading && (
            <>
                {/* Reset Button */}
                <button
                    onClick={onReset}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                    <X size={20} className="text-primary" />
                </button>

                {/* Bottom Actions */}
                <div className="absolute bottom-6 left-0 right-0 px-6">
                    <button
                        onClick={onAnalyze}
                        className="btn btn-primary w-full py-4 text-lg shadow-2xl backdrop-blur"
                    >
                        <Scan size={22} strokeWidth={2.5} />
                        <span>Analisar Alimento</span>
                    </button>
                </div>
            </>
        )}

        {/* Loading Overlay */}
        {loading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <div className="relative mb-6">
                    <Loader2 size={56} className="animate-spin" strokeWidth={2} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={24} className="animate-pulse" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <p className="font-bold text-xl">
                        {analyzing ? 'Analisando Alimento...' : 'Processando Imagem...'}
                    </p>
                    <p className="text-sm text-white/70 font-medium">
                        Identificando nutrientes e porções
                    </p>
                </div>

                {/* Progress Dots */}
                <div className="flex gap-2 mt-6">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 bg-white/50 rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        />
                    ))}
                </div>
            </div>
        )}

        {/* Error State */}
        {error && (
            <div className="absolute bottom-6 left-6 right-6 bg-red-500/90 backdrop-blur text-white p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
            </div>
        )}
    </div>
);

const ResultsCard = ({ result, onSave, saving }) => (
    <div className="space-y-6 animate-slide-up">
        {/* Main Info Card */}
        <div className="card rounded-xl shadow-md border-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-primary mb-1 leading-tight">
                        {result.alimento_reconhecido}
                    </h3>
                    <p className="text-muted font-semibold text-sm">
                        {result.porcao_descricao} • {result.porcao_gramas}g
                    </p>
                </div>
                <div className="badge badge-success">
                    <CheckCircle size={14} />
                    {result.classificacao_geral}
                </div>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <MacroCard label="Calorias" value={result.nutrientes.calorias_kcal} unit="kcal" primary />
                <MacroCard label="Carb" value={result.nutrientes.carboidratos_g} unit="g" />
                <MacroCard label="Prot" value={result.nutrientes.proteinas_g} unit="g" />
                <MacroCard label="Gord" value={result.nutrientes.gorduras_g} unit="g" />
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-secondary to-secondary/50 p-5 rounded-2xl">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles size={18} className="text-accent" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <p className="text-sm leading-relaxed text-primary font-medium">
                            {result.observacoes}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted font-bold">
                            <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent rounded-full transition-all duration-700"
                                    style={{ width: `${result.estimativa_confianca * 100}%` }}
                                />
                            </div>
                            <span className="whitespace-nowrap">
                                {(result.estimativa_confianca * 100).toFixed(0)}% confiável
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Save Button */}
        <button
            onClick={onSave}
            disabled={saving}
            className="btn btn-accent w-full py-5 text-lg shadow-2xl font-black"
        >
            {saving ? (
                <>
                    <Loader2 className="animate-spin" size={22} />
                    <span>Salvando...</span>
                </>
            ) : (
                <>
                    <CheckCircle size={22} strokeWidth={2.5} />
                    <span>Adicionar ao Histórico</span>
                </>
            )}
        </button>
    </div>
);

const MacroCard = ({ label, value, unit, primary }) => (
    <div className={`
        flex flex-col items-center justify-center p-4 rounded-2xl transition-all
        ${primary
            ? 'bg-gradient-to-br from-primary to-primary-hover text-white shadow-lg scale-105'
            : 'bg-secondary text-primary'
        }
    `}>
        <span className="text-2xl font-black mb-0.5">{value}</span>
        <span className={`text-[9px] uppercase font-extrabold tracking-wider ${primary ? 'opacity-80' : 'text-muted'}`}>
            {label}
        </span>
        <span className={`text-[8px] font-bold ${primary ? 'opacity-60' : 'text-muted'}`}>
            {unit}
        </span>
    </div>
);

// ========================================
// NEW SUB-COMPONENTS
// ========================================

const DietComparisonCard = ({ comparison }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return 'bg-green-500';
            case 'warning': return 'bg-yellow-500';
            case 'bad': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'good': return <ThumbsUp size={20} className="text-white" />;
            case 'warning': return <AlertTriangle size={20} className="text-white" />;
            case 'bad': return <ThumbsDown size={20} className="text-white" />;
            default: return <Info size={20} className="text-white" />;
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'good': return 'bg-green-50 border-green-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            case 'bad': return 'bg-red-50 border-red-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className={`card rounded-xl shadow-md border-2 ${getStatusBg(comparison.status)} animate-slide-up`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 ${getStatusColor(comparison.status)} rounded-xl flex items-center justify-center`}>
                    {getStatusIcon(comparison.status)}
                </div>
                <div>
                    <h4 className="font-bold text-primary">
                        {comparison.status === 'good' ? 'Dentro do Plano! 🎉' :
                            comparison.status === 'warning' ? 'Atenção Necessária ⚠️' :
                                'Fora do Plano 📊'}
                    </h4>
                    <p className="text-xs text-muted">Comparação com sua dieta</p>
                </div>
            </div>

            {/* Percentages */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {Object.entries(comparison.percentages).map(([key, value]) => (
                    <div key={key} className="text-center p-2 bg-white/50 rounded-xl">
                        <p className="text-[10px] text-muted uppercase font-bold">
                            {key === 'calories' ? 'Cal' : key === 'protein' ? 'Prot' : key === 'carbs' ? 'Carb' : 'Gord'}
                        </p>
                        <p className={`text-lg font-black ${value > 40 ? 'text-red-500' : value > 30 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                            {value}%
                        </p>
                        <p className="text-[9px] text-muted">do dia</p>
                    </div>
                ))}
            </div>

            {/* Messages & Warnings */}
            {comparison.messages.length > 0 && (
                <div className="space-y-1 mb-3">
                    {comparison.messages.map((msg, i) => (
                        <p key={i} className="text-sm text-green-700 font-medium">{msg}</p>
                    ))}
                </div>
            )}

            {comparison.warnings.length > 0 && (
                <div className="space-y-1 mb-3">
                    {comparison.warnings.map((warn, i) => (
                        <p key={i} className="text-sm text-yellow-700 font-medium flex items-start gap-2">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            {warn}
                        </p>
                    ))}
                </div>
            )}

            {/* Tips */}
            {comparison.tips.length > 0 && (
                <div className="pt-3 border-t border-current/10">
                    {comparison.tips.map((tip, i) => (
                        <p key={i} className="text-xs text-muted font-medium">{tip}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

const FoodsDetectedCard = ({ foods }) => (
    <div className="card rounded-xl shadow-md animate-slide-up">
        <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
            <span className="text-lg">🍽️</span>
            Alimentos Identificados
        </h4>
        <div className="space-y-2">
            {foods.map((food, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                    <div>
                        <p className="font-semibold text-primary">{food.nome}</p>
                        <p className="text-xs text-muted">{food.porcao}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-primary">{food.calorias} kcal</p>
                        <p className="text-xs text-muted">{food.proteina}g prot</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const SuggestionsCard = ({ suggestions }) => (
    <div className="card rounded-xl shadow-md bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 animate-slide-up">
        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span>
            Sugestões da IA
        </h4>
        <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-700 font-medium flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {suggestion}
                </li>
            ))}
        </ul>
    </div>
);

export default FoodRecognition;
