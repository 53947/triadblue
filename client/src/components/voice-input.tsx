import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  continuous?: boolean;
  language?: string;
}

export function VoiceInput({
  onTranscript,
  onInterimTranscript,
  className,
  variant = "outline",
  size = "icon",
  continuous = false,
  language = "en-US",
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onInterimTranscriptRef = useRef(onInterimTranscript);
  const { toast } = useToast();

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onInterimTranscriptRef.current = onInterimTranscript;
  }, [onInterimTranscript]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript && onTranscriptRef.current) {
        onTranscriptRef.current(finalTranscript.trim());
      }

      if (interimTranscript && onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive",
        });
      } else if (event.error === "no-speech") {
        toast({
          title: "No speech detected",
          description: "Please try speaking again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Speech recognition error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
      }
      
      if (onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current("");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current("");
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, language, toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      if (onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current("");
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast({
          title: "Could not start voice input",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={toggleListening}
      className={className}
      data-testid="button-voice-input"
      title={isListening ? "Stop recording" : "Start voice input"}
    >
      {isListening ? (
        <MicOff className="w-4 h-4 text-destructive animate-pulse" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  );
}

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  className?: string;
  continuous?: boolean;
  language?: string;
  buttonText?: string;
  showIcon?: boolean;
}

export function VoiceInputButton({
  onTranscript,
  onInterimTranscript,
  className,
  continuous = false,
  language = "en-US",
  buttonText,
  showIcon = true,
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);
  const onInterimTranscriptRef = useRef(onInterimTranscript);
  const { toast } = useToast();

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onInterimTranscriptRef.current = onInterimTranscript;
  }, [onInterimTranscript]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript && onTranscriptRef.current) {
        onTranscriptRef.current(finalTranscript.trim());
      }

      if (interimTranscript && onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive",
        });
      } else if (event.error === "no-speech") {
        toast({
          title: "No speech detected",
          description: "Please try speaking again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Speech recognition error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
      }
      
      if (onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current("");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current("");
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, language, toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      if (onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current("");
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast({
          title: "Could not start voice input",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      onClick={toggleListening}
      className={className}
      data-testid="button-voice-input-text"
    >
      {showIcon && (
        isListening ? (
          <MicOff className="w-4 h-4 mr-2" />
        ) : (
          <Mic className="w-4 h-4 mr-2" />
        )
      )}
      {buttonText || (isListening ? "Stop Recording" : "Start Voice Input")}
    </Button>
  );
}
