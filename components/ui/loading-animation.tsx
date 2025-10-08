export function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin glass-subtle shadow-lg"></div>

        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-gradient-to-r from-primary to-chart-2 rounded-full transform -translate-x-1/2 animate-bounce"></div>
          <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-gradient-to-r from-chart-2 to-chart-3 rounded-full transform -translate-x-1/2 animate-bounce delay-100"></div>
          <div className="absolute left-0 top-1/2 w-2.5 h-2.5 bg-gradient-to-r from-chart-3 to-primary rounded-full transform -translate-y-1/2 animate-bounce delay-200"></div>
          <div className="absolute right-0 top-1/2 w-2 h-2 bg-gradient-to-r from-primary to-chart-4 rounded-full transform -translate-y-1/2 animate-bounce delay-300"></div>
        </div>

        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping glass-subtle"></div>
        <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-ping delay-75 glass-subtle"></div>
        <div className="absolute inset-4 rounded-full border border-primary/40 animate-ping delay-150 glass-subtle"></div>
      </div>

      <div className="ml-6 space-y-2">
        <div className="text-xl font-bold gradient-text animate-pulse">Analisando produtos...</div>
        <div className="text-sm text-muted-foreground animate-pulse delay-100">
          Encontrando as melhores opções para você
        </div>
        <div className="flex items-center gap-1 mt-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  )
}
