'use client';
import { useState } from 'react';
import { PlusCircle, LoaderCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { indexTeamDocuments } from '@/ai/flows/index-team-documents';

type DataSource = {
  id: string;
  source: 'Notion' | 'Google Docs' | 'Confluence';
  name: string;
  status: 'Connected' | 'Error';
  lastIndexed: string;
};

const initialDataSources: DataSource[] = [
  { id: '1', source: 'Notion', name: 'Engineering Wiki', status: 'Connected', lastIndexed: '2 hours ago' },
  { id: '2', source: 'Google Docs', name: 'Marketing Plans', status: 'Connected', lastIndexed: '1 day ago' },
  { id: '3', source: 'Confluence', name: 'HR Policies', status: 'Error', lastIndexed: '3 days ago' },
];

const formSchema = z.object({
  documentSource: z.string({ required_error: 'Please select a source.' }),
  apiKey: z.string().min(1, 'API Key is required.'),
  databaseId: z.string().min(1, 'Database ID is required.'),
});

export function DataSourcesClient() {
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: '',
      databaseId: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsIndexing(true);
    try {
      const result = await indexTeamDocuments(values);
      if (result.success) {
        toast({
          title: 'Success',
          description: `Successfully started indexing for ${values.documentSource}.`,
        });
        // In a real app, you'd probably poll for status or use websockets
        const newSource: DataSource = {
            id: Date.now().toString(),
            source: values.documentSource as any,
            name: `${values.documentSource} Source`,
            status: 'Connected',
            lastIndexed: 'Just now'
        };
        setDataSources(prev => [...prev, newSource]);
        setIsDialogOpen(false);
        form.reset();
      } else {
        throw new Error('Indexing failed');
      }
    } catch (error) {
      console.error('Failed to index documents:', error);
      toast({
        variant: 'destructive',
        title: 'Indexing Failed',
        description: 'Could not start indexing process. Please check your credentials.',
      });
    } finally {
      setIsIndexing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Data Sources</CardTitle>
                <CardDescription>
                    Manage and index your team's documents from various sources.
                </CardDescription>
            </div>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="ml-auto gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Source
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Data Source</DialogTitle>
                        <DialogDescription>Connect a new source to start indexing documents.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="documentSource"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a document source" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Notion">Notion</SelectItem>
                                                <SelectItem value="Google Docs">Google Docs</SelectItem>
                                                <SelectItem value="Confluence">Confluence</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="apiKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Key</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••••••••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="databaseId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Database ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., a0b1c2d3e4f5..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isIndexing}>
                                    {isIndexing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Start Indexing
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Indexed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataSources.map((ds) => (
              <TableRow key={ds.id}>
                <TableCell className="font-medium">{ds.source}</TableCell>
                <TableCell>{ds.name}</TableCell>
                <TableCell>
                  <Badge variant={ds.status === 'Connected' ? 'default' : 'destructive'} className={ds.status === 'Connected' ? 'bg-green-600/80 hover:bg-green-600/90' : ''}>
                    {ds.status === 'Connected' ? <CheckCircle className="h-3 w-3 mr-1.5"/> : <AlertCircle className="h-3 w-3 mr-1.5"/>}
                    {ds.status}
                  </Badge>
                </TableCell>
                <TableCell>{ds.lastIndexed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
