import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function KickedOut() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto"
      >
        <Badge variant="secondary" className="mb-4">
          Intervue.io
        </Badge>
        
        <Card className="card-gradient">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-4"
            >
              <AlertTriangle className="h-16 w-16 text-warning mx-auto" />
            </motion.div>
            
            <h2 className="text-2xl font-bold mb-2">
              You've been Kicked out!
            </h2>
            <p className="text-muted-foreground text-sm">
              Looks like you need to refresh this tab! Click refresh. Please contact your instructor if you think this is a mistake.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}