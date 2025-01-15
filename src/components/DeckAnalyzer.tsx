"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload } from 'lucide-react';

const DeckAnalyzer = () => {
  const [files, setFiles] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const parseDecklist = (deckText) => {
    const sections = deckText.trim().split('\n\n');
    const mainDeck = {};
    const sideboard = {};
    
    // Parse main deck
    sections[0].trim().split('\n').forEach(line => {
      if (line.trim()) {
        const [quantity, ...cardNameParts] = line.split(' ');
        const cardName = cardNameParts.join(' ');
        mainDeck[cardName] = parseInt(quantity);
      }
    });
    
    // Parse sideboard if it exists
    if (sections.length > 1) {
      sections[1].trim().split('\n').forEach(line => {
        if (line.trim()) {
          const [quantity, ...cardNameParts] = line.split(' ');
          const cardName = cardNameParts.join(' ');
          sideboard[cardName] = parseInt(quantity);
        }
      });
    }
    
    return { mainDeck, sideboard };
  };

  const findCommonCards = (deckList) => {
    if (!deckList.length) return {};
    
    const commonCards = { ...deckList[0] };
    
    for (let i = 1; i < deckList.length; i++) {
      const deck = deckList[i];
      Object.keys(commonCards).forEach(card => {
        if (!(card in deck)) {
          delete commonCards[card];
        } else {
          commonCards[card] = Math.min(commonCards[card], deck[card]);
        }
      });
    }
    
    return commonCards;
  };

  const analyzeCardDistribution = (deckList) => {
    const cardAppearances = {};
    const cardQuantities = {};
    
    deckList.forEach(deck => {
      Object.entries(deck).forEach(([card, quantity]) => {
        cardAppearances[card] = (cardAppearances[card] || 0) + 1;
        cardQuantities[card] = cardQuantities[card] || {};
        cardQuantities[card][quantity] = (cardQuantities[card][quantity] || 0) + 1;
      });
    });
    
    return { cardAppearances, cardQuantities };
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files) return;
    
    // Convert FileList to Array and combine with existing files
    const newFiles = Array.from(e.target.files);
    const allFiles = [...files, ...newFiles];
    setFiles(allFiles);
    
    const mainDecks = [];
    const sideboards = [];
    
    try {
      // Process all files
      for (const file of allFiles) {
        const text = await file.text();
        const { mainDeck, sideboard } = parseDecklist(text);
        mainDecks.push(mainDeck);
        sideboards.push(sideboard);
      }
      
      const commonMain = findCommonCards(mainDecks);
      const commonSide = findCommonCards(sideboards);
      const mainAnalysis = analyzeCardDistribution(mainDecks);
      const sideAnalysis = analyzeCardDistribution(sideboards);
      
      setAnalysis({
        commonMain,
        commonSide,
        mainAnalysis,
        sideAnalysis,
        totalDecks: mainDecks.length
      });
    } catch (error) {
      console.error('Error processing files:', error);
    }
  };

  const exportAnalysis = () => {
    if (!analysis) return;
    
    const formatCards = (cards) => {
      return Object.entries(cards)
        .sort(([, a], [, b]) => b - a)
        .map(([card, quantity]) => `${quantity} ${card}`)
        .join('\n');
    };
    
    const formatDistribution = (analysis, totalDecks) => {
      return Object.entries(analysis.cardAppearances)
        .sort(([, a], [, b]) => b - a)
        .map(([card, appearances]) => {
          const quantities = analysis.cardQuantities[card];
          const quantityStr = Object.entries(quantities)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .map(([quantity, decks]) => `${quantity} copies in ${decks} deck(s)`)
            .join(', ');
          return `${card} (${appearances}/${totalDecks} decks): ${quantityStr}`;
        })
        .join('\n');
    };
    
    const content = `=== Cards common to ALL main decks ===\n${formatCards(analysis.commonMain)}

=== Main deck card variations ===\n${formatDistribution(analysis.mainAnalysis, analysis.totalDecks)}

=== Cards common to ALL sideboards ===\n${formatCards(analysis.commonSide)}

=== Sideboard card variations ===\n${formatDistribution(analysis.sideAnalysis, analysis.totalDecks)}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deck-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const CardList = ({ cards }) => (
    <div className="space-y-2">
      {Object.entries(cards)
        .sort(([, a], [, b]) => b - a)
        .map(([card, quantity]) => (
          <div key={card} className="flex justify-between p-2 bg-gray-100 rounded">
            <span>{card}</span>
            <span className="font-mono">{quantity}</span>
          </div>
        ))}
    </div>
  );

  const DistributionList = ({ analysis, totalDecks }) => (
    <div className="space-y-4">
      {Object.entries(analysis.cardAppearances)
        .sort(([, a], [, b]) => b - a)
        .map(([card, appearances]) => {
          const quantities = analysis.cardQuantities[card];
          return (
            <div key={card} className="p-3 bg-gray-100 rounded">
              <div className="flex justify-between">
                <span className="font-medium">{card}</span>
                <span className="text-gray-600">
                  {appearances}/{totalDecks} decks
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {Object.entries(quantities)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([quantity, decks]) => (
                    <span key={quantity} className="mr-4">
                      {quantity} copies in {decks} deck(s)
                    </span>
                  ))}
              </div>
            </div>
          );
        })}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>MTG Deck Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Select multiple .txt files containing decklists
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".txt"
                  onChange={handleFileUpload}
                  onClick={(e) => {
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
            {files.length > 0 && (
              <div className="text-sm text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Uploaded files ({files.length}):</span>
                  <button
                    onClick={() => {
                      setFiles([]);
                      setAnalysis(null);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Clear all
                  </button>
                </div>
                <ul className="mt-1 space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{file.name}</span>
                      <button
                        onClick={() => {
                          const newFiles = files.filter((_, i) => i !== index);
                          setFiles(newFiles);
                          if (newFiles.length === 0) {
                            setAnalysis(null);
                          } else {
                            handleFileUpload({ target: { files: newFiles } });
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <>
          <div className="mb-4">
            <button
              onClick={exportAnalysis}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Export Analysis
            </button>
          </div>
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="main">Main Deck</TabsTrigger>
              <TabsTrigger value="side">Sideboard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="main">
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Cards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardList cards={analysis.commonMain} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Card Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DistributionList
                      analysis={analysis.mainAnalysis}
                      totalDecks={analysis.totalDecks}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="side">
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Cards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardList cards={analysis.commonSide} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Card Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DistributionList
                      analysis={analysis.sideAnalysis}
                      totalDecks={analysis.totalDecks}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default DeckAnalyzer;