interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function NameInput({ value, onChange }: NameInputProps) {
  return (
    <div className="w-full">
      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
        الاسم
      </label>
      <input
        type="text"
        id="name"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اكتب الاسم"
        className="w-full px-4 py-3 bg-[#151A22] border border-gray-700 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
      />
    </div>
  );
}
