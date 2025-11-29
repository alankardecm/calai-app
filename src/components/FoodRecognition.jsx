
const MacroItem = ({ label, value, unit, active }) => (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl ${active ? 'bg-primary text-white shadow-lg' : 'bg-secondary text-text-main'}`}>
        <span className="text-xl font-extrabold">{value}</span>
        <span className={`text-[10px] uppercase font-bold ${active ? 'opacity-80' : 'text-muted'}`}>{label}</span>
    </div>
);

export default FoodRecognition;
