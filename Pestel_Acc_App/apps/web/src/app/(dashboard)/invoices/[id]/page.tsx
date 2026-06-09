export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Invoice #{params.id}</h1>
      {/* Invoice preview, status badge, Send/Void/PDF download buttons */}
      {/* Payment history */}
      {/* Add payment form */}
    </div>
  );
}
