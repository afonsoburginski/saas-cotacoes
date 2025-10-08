"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Plus, TrendingUp, Star } from "lucide-react"
import { useSmartComparison } from "@/hooks/use-smart-comparison"
import type { ProductSimilarity } from "@/lib/smart-comparison"

interface SmartComparisonSuggestionsProps {
  className?: string
}

export function SmartComparisonSuggestions({ className }: SmartComparisonSuggestionsProps) {
  const { suggestions, applySuggestion, isInComparison } = useSmartComparison()

  if (suggestions.length === 0) return null

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Sugestões Inteligentes</h3>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.baseProduct.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Produtos similares a "{suggestion.baseProduct.nome}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {suggestion.suggestions.map((similar) => (
                  <SuggestionCard
                    key={similar.product.id}
                    similarity={similar}
                    onApply={() => applySuggestion(similar)}
                    isInComparison={isInComparison(similar.product.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface SuggestionCardProps {
  similarity: ProductSimilarity
  onApply: () => void
  isInComparison: boolean
}

function SuggestionCard({ similarity, onApply, isInComparison }: SuggestionCardProps) {
  const { product, similarityScore, reasons } = similarity

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm">{product.nome}</h4>
          <Badge variant="secondary" className="text-xs">
            {Math.round(similarityScore)}% similar
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
          <span>{product.storeNome}</span>
          <span className="font-medium text-primary">R$ {product.preco.toFixed(2)}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{product.rating}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {reasons.map((reason, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {reason}
            </Badge>
          ))}
        </div>
      </div>

      <Button
        size="sm"
        variant={isInComparison ? "secondary" : "default"}
        onClick={onApply}
        disabled={isInComparison}
        className="ml-3"
      >
        {isInComparison ? (
          "Na Comparação"
        ) : (
          <>
            <Plus className="h-3 w-3 mr-1" />
            Comparar
          </>
        )}
      </Button>
    </div>
  )
}
