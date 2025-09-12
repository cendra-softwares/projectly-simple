import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-card animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold gradient-primary bg-clip-text text-transparent">
            404
          </CardTitle>
          <p className="text-xl text-muted-foreground mt-2">Page Not Found</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for.
            It might have been moved or doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button 
              onClick={() => window.location.href = "/"}
              className="gradient-primary text-white hover:opacity-90 transition-opacity"
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
