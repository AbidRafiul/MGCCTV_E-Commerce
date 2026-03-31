    import { Landmark, Wallet, ShieldCheck, CreditCard } from "lucide-react";

    export default function PaymentMethodCard({ selectedPayment, setSelectedPayment }) {
    
    // Daftar metode pembayaran yang didukung Payment Gateway MGCCTV
    const paymentOptions = [
        { 
        id: "bni", 
        title: "BNI Virtual Account", 
        type: "Transfer Bank Otomatis", 
        icon: Landmark, 
        color: "text-orange-600", 
        bg: "bg-orange-100" 
        },
        { 
        id: "bri", 
        title: "BRI Virtual Account", 
        type: "Transfer Bank Otomatis", 
        icon: Landmark, 
        color: "text-blue-600", 
        bg: "bg-blue-100" 
        },
        { 
        id: "mandiri", 
        title: "Mandiri Virtual Account", 
        type: "Transfer Bank Otomatis", 
        icon: Landmark, 
        color: "text-yellow-600", 
        bg: "bg-yellow-100" 
        },
        { 
        id: "gopay", 
        title: "GoPay", 
        type: "E-Wallet / QRIS", 
        icon: Wallet, 
        color: "text-green-500", 
        bg: "bg-green-100" 
        },
    ];

    return (
        <div className="rounded-[28px] bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-100 hover:shadow-lg hover:ring-blue-100 transition-all">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <CreditCard className="text-blue-600" size={22} /> Metode Pembayaran
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentOptions.map((opt) => (
            <label 
                key={opt.id} 
                className={`relative flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPayment === opt.id 
                    ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-900/5' 
                    : 'border-slate-100 hover:border-blue-200 bg-white'
                }`}
            >
                <input 
                type="radio" 
                name="payment" 
                value={opt.id} 
                className="sr-only" 
                onChange={(e) => setSelectedPayment(e.target.value)} 
                checked={selectedPayment === opt.id} 
                />
                
                <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 ${opt.bg} ${opt.color} rounded-xl`}>
                    <opt.icon size={22} />
                </div>
                {selectedPayment === opt.id && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                    <ShieldCheck size={14} />
                    </span>
                )}
                </div>
                
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">{opt.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{opt.type}</p>
            </label>
            ))}
        </div>
        </div>
    );
    }