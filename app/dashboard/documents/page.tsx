import { requireAuth } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2 } from 'lucide-react';

export default async function DocumentsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Documents</h1>
        <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2">View your contracts, invoices, and uploaded files</p>
      </div>

      {documents && documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((doc: any) => (
            <Card key={doc.id}>
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-slate-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{doc.file_name}</h3>
                      <p className="text-sm text-slate-600">
                        {doc.document_type === 'contract' && '📋 Contract'}
                        {doc.document_type === 'photo' && '📷 Photo'}
                        {doc.document_type === 'invoice' && '💰 Invoice'}
                        {doc.document_type === 'other' && '📎 Other'}
                        {' · '}
                        {(doc.file_size / 1024).toFixed(0)} KB
                        {' · '}
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-auto sm:ml-0">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-slate-600 mb-4">No documents yet</p>
            <p className="text-sm text-slate-500">
              Documents will appear here once you complete an inspection
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
