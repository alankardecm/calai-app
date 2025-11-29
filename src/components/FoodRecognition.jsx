import React, { useState } from 'react';
import { Camera, Upload, Scan, CheckCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const FoodRecognition = () => {
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setResult(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);

        try {
            // MOCK PARA DEMONSTRAÇÃO (Remova quando conectar o n8n)
            setTimeout(() => {
                const mockResponse = {
                    "alimento_reconhecido": "Frango Grelhado com Salada",
                    "classificacao_geral": "Refeição Saudável",
                    "porcao_descricao": "1 prato médio",
                    "porcao_gramas": 350,
                    "nutrientes": {
                        "carboidratos_g": 12,
                        "proteinas_g": 45,
                        "gorduras_g": 10,
                        "calorias_kcal": 320
                    },
                    "estimativa_confianca": 0.92,
                    "observacoes": "Excelente escolha proteica. Baixo teor de gordura visível."
                };
                setResult(mockResponse);
                setLoading(false);
            }, 2000);

        } catch (err) {
            console.error("Erro ao analisar imagem:", err);
            setError("Erro ao analisar. Tente novamente.");
            setLoading(false);
        }
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
                        confidence: result.estimativa_confianca
                    }
                ]);

            if (dbError) throw dbError;

            alert('Refeição salva com sucesso!');
            setImage(null);
            setResult(null);
            setImageFile(null);

        } catch (err) {
            console.error("Erro ao salvar:", err);
            alert('Erro ao salvar refeição: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-20">
            <div className="text-center space-y-2 py-4">
                <h2 className="text-3xl font-extrabold text-primary">O que você comeu?</h2>
                <p className="text-muted text-lg">Tire uma foto para rastrear suas calorias</p>
            </div>

            <div className="bg-card rounded-[32px] overflow-hidden shadow-lg border-0">
                {!image ? (
                    <div className="p-10 flex flex-col items-center justify-center gap-6 text-center bg-secondary/30 min-h-[300px]">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                            <Camera size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Adicionar Refeição</h3>
                            <p className="text-muted text-sm max-w-[200px] mx-auto">Tire uma foto ou faça upload da galeria</p>
                        </div>
                        <div className="flex gap-4 w-full max-w-xs">
                            <label className="btn btn-primary flex-1 cursor-pointer">
                                <Camera size={18} />
                                <span>Câmera</span>
                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                            </label>
                            <label className="btn btn-outline flex-1 cursor-pointer bg-white">
                                <Upload size={18} />
                                <span>Galeria</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <img src={image} alt="Preview" className="w-full h-[300px] object-cover" />
                        {!result && !loading && (
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
                                <button onClick={() => setImage(null)} className="btn btn-outline bg-white/90 backdrop-blur border-0 text-black shadow-lg">
                                    Trocar
                                </button>
                                <button onClick={analyzeImage} className="btn btn-primary shadow-lg">
                                    <Scan size={18} /> Analisar
                                </button>
                            </div>
                        )}
                        {loading && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                <Loader2 size={48} className="animate-spin mb-4" />
                                <p className="font-bold text-lg">Analisando Alimento...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {result && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-card rounded-[24px] p-6 border-0 shadow-md">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-extrabold text-primary mb-1">{result.alimento_reconhecido}</h3>
                                <p className="text-muted font-medium">{result.porcao_descricao} • {result.porcao_gramas}g</p>
                            </div>
                            <div className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {result.classificacao_geral}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-6">
                            <MacroItem label="Calorias" value={result.nutrientes.calorias_kcal} unit="kcal" active />
                            <MacroItem label="Carb" value={result.nutrientes.carboidratos_g} unit="g" />
                            <MacroItem label="Prot" value={result.nutrientes.proteinas_g} unit="g" />
                            <MacroItem label="Gord" value={result.nutrientes.gorduras_g} unit="g" />
                        </div>

                        <div className="bg-secondary p-4 rounded-xl text-sm text-muted flex items-start gap-3">
                            <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
                            <div>
                                <p className="leading-relaxed text-text-main">{result.observacoes}</p>
                                <p className="mt-2 text-xs opacity-60 font-bold">Confiança da IA: {(result.estimativa_confianca * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={saveMeal}
                        disabled={saving}
                        className="btn btn-primary w-full py-4 text-lg shadow-xl"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : 'Salvar no Histórico'}
                    </button>
                </div>
            )}
        </div>
    );
};

const MacroItem = ({ label, value, unit, active }) => (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl ${active ? 'bg-primary text-white shadow-lg' : 'bg-secondary text-text-main'}`}>
        <span className="text-xl font-extrabold">{value}</span>
        <span className={`text-[10px] uppercase font-bold ${active ? 'opacity-80' : 'text-muted'}`}>{label}</span>
    </div>
);

export default FoodRecognition;
