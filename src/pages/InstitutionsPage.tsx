import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Institution } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Globe, School } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createInstitution, getInstitutions } from '@/lib/teacher-student-api';

export default function InstitutionsPage() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form state
  const [institutionName, setInstitutionName] = useState('');
  const [institutionDomain, setInstitutionDomain] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Check if user can manage institutions
  const canManageInstitutions = user?.role === 'institution_admin';
  
  // Fetch institutions on component mount
  useEffect(() => {
    fetchInstitutions();
  }, []);
  
  async function fetchInstitutions() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await getInstitutions();
      
      if (error) {
        console.error('Error fetching institutions:', error);
        setError('Failed to load institutions. Please try again later.');
        return;
      }
      
      setInstitutions(data || []);
    } catch (err) {
      console.error('Error in fetchInstitutions:', err);
      setError('An unexpected error occurred while loading institutions.');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleAddInstitution(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    
    if (!institutionName || !institutionDomain) {
      setFormError('Please fill in all fields');
      setFormLoading(false);
      return;
    }
    
    try {
      const { data, error } = await createInstitution(institutionName, institutionDomain);
      
      if (error) {
        console.error('Error creating institution:', error);
        setFormError(typeof error === 'string' ? error : 'Failed to create institution');
        setFormLoading(false);
        return;
      }
      
      // Reset form and close dialog
      setInstitutionName('');
      setInstitutionDomain('');
      setShowAddDialog(false);
      
      // Refresh institutions list
      fetchInstitutions();
    } catch (err) {
      console.error('Error in handleAddInstitution:', err);
      setFormError('An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Institutions</h1>
        
        {canManageInstitutions && (
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Institution
          </Button>
        )}
      </div>
      
      {error && (
        <Alert className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertDescription className="text-red-500">{error}</AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-zinc-900 dark:border-white"></div>
        </div>
      ) : (
        <>
          {institutions.length === 0 ? (
            <div className="text-center py-10">
              <School className="h-12 w-12 mx-auto text-zinc-400 mb-3" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">No institutions found</h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                {canManageInstitutions 
                  ? 'Click the "Add Institution" button to create your first institution.' 
                  : 'There are no institutions available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {institutions.map((institution) => (
                <Card key={institution.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                      {institution.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                      <Globe className="h-4 w-4" />
                      {institution.domain}
                    </CardDescription>
                  </CardHeader>
                  
                  {canManageInstitutions && (
                    <CardFooter className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 border-zinc-200 dark:border-zinc-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Add Institution Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Institution</DialogTitle>
            <DialogDescription>
              Add a new educational institution to TutorAI.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddInstitution}>
            {formError && (
              <Alert className="mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertDescription className="text-red-500">{formError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="institution-name">Institution Name</Label>
                <Input
                  id="institution-name"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. New York University (NYU)"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="institution-domain">Email Domain</Label>
                <Input
                  id="institution-domain"
                  value={institutionDomain}
                  onChange={(e) => setInstitutionDomain(e.target.value)}
                  placeholder="e.g. nyu.edu"
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
                className="border-zinc-200 dark:border-zinc-700"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <span className="mr-2">Creating...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  'Create Institution'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 