import React, {
  useState,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
  Keyboard,
  Platform,
  BackHandler,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import AppText from "../AppText";
import { theme } from "../../../config/theme";
import Icon from "../Icon";
import CategorySelectionModal from "../modals/CategorySelectionModal";
import { Word } from "../../../types/database";

export interface WordEditSheetRef {
  present: (initialData?: Word | null) => void;
  dismiss: () => void;
}

interface WordEditSheetProps {
  onSave: (
    data: { name: string; meaning: string; category: string | null },
    wordId?: number
  ) => Promise<void>;
}

const WordEditSheet = forwardRef<WordEditSheetRef, WordEditSheetProps>(
  ({ onSave }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const nameInputRef = useRef<TextInput>(null);
    const meaningInputRef = useRef<TextInput>(null);

    const [wordId, setWordId] = useState<number | undefined>(undefined);
    const [name, setName] = useState("");
    const [meaning, setMeaning] = useState("");
    const [category, setCategory] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const isEditMode = !!wordId;

    const snapPoints = useMemo(() => {
      return isKeyboardVisible ? ["81.5%"] : ["61.5%"];
    }, [isKeyboardVisible]);

    useEffect(() => {
      const showSubscription = Keyboard.addListener(
        Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
        () => setIsKeyboardVisible(true)
      );

      const hideSubscription = Keyboard.addListener(
        Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
        () => setIsKeyboardVisible(false)
      );

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, []);

    // Efeito para intercetar o botão de voltar do Android
    useEffect(() => {
      const backAction = () => {
        if (isSheetOpen) {
          // Se o BottomSheet estiver aberto, fecha-o e previne a ação padrão.
          handleClose();
          return true; // Indica que o evento foi tratado.
        }
        // Se não estiver aberto, permite que o comportamento padrão (voltar no ecrã) aconteça.
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      // Limpa o listener quando o componente é desmontado.
      return () => backHandler.remove();
    }, [isSheetOpen]); // A dependência garante que a lógica tem sempre o estado mais recente de `isSheetOpen`.

    useImperativeHandle(ref, () => ({
      present: (initialData) => {
        setWordId(initialData?.id);
        setName(initialData?.name || "");
        setMeaning(initialData?.meaning || "");
        setCategory(initialData?.category || null);
        bottomSheetRef.current?.present();
      },
      dismiss: () => {
        bottomSheetRef.current?.dismiss();
      },
    }));

    const handleSave = async () => {
      setIsSaving(true);
      try {
        await onSave({ name, meaning, category }, wordId);
      } catch (error) {
        // O erro já é tratado no ecrã pai, mas paramos o estado de 'saving' aqui.
        console.log("Save failed, handled by parent screen.", error);
      } finally {
        setIsSaving(false);
      }
    };

    const handleClose = () => {
      Keyboard.dismiss();
      bottomSheetRef.current?.dismiss();
    };

    const getCategoryColor = (categoryName: string | null): string => {
      if (!categoryName) return theme.colors.border;
      const key = categoryName as keyof typeof theme.colors.category;
      const defaultKey = "Outro" as keyof typeof theme.colors.category;
      return theme.colors.category[key] || theme.colors.category[defaultKey];
    };

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      []
    );

    const handleSheetChange = useCallback((index: number) => {
      setIsSheetOpen(index > -1);
    }, []);

    return (
      <>
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backgroundStyle={styles.modalContainer}
          handleIndicatorStyle={styles.modalHandle}
          onChange={handleSheetChange}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHeader}>
              <AppText variant="bold" style={styles.modalTitle}>
                {isEditMode ? "Editar Palavra" : "Nova Palavra"}
              </AppText>
              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.8}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={theme.colors.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>PALAVRA</AppText>
                <Pressable
                  style={styles.inputContainer}
                  onPress={() => nameInputRef.current?.focus()}
                >
                  <Icon name="text" style={styles.inputIcon} size={22} />
                  <TextInput
                    ref={nameInputRef}
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: Apple"
                    placeholderTextColor={theme.colors.placeholder}
                    autoCapitalize="none"
                  />
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <AppText style={styles.label}>SIGNIFICADO</AppText>
                <Pressable
                  style={styles.inputContainer}
                  onPress={() => meaningInputRef.current?.focus()}
                >
                  <Icon name="chat" style={styles.inputIcon} size={22} />
                  <TextInput
                    ref={meaningInputRef}
                    style={styles.input}
                    value={meaning}
                    onChangeText={setMeaning}
                    placeholder="Ex: Maçã"
                    placeholderTextColor={theme.colors.placeholder}
                    autoCapitalize="none"
                  />
                </Pressable>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <AppText style={styles.label}>CATEGORIA</AppText>
              <TouchableOpacity
                style={styles.categorySelector}
                activeOpacity={0.8}
                onPress={() => setIsCategoryModalVisible(true)}
              >
                <View style={styles.categorySelectorContent}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryColor(category) },
                    ]}
                  />
                  <AppText
                    style={
                      category
                        ? styles.categoryText
                        : styles.categoryPlaceholder
                    }
                  >
                    {category || "Escolha uma categoria"}
                  </AppText>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.buttonDisabled]}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText variant="bold" style={styles.saveButtonText}>
                  {isEditMode ? "Guardar Alterações" : "Adicionar Palavra"}
                </AppText>
              )}
            </TouchableOpacity>
          </BottomSheetScrollView>
        </BottomSheetModal>
        <CategorySelectionModal
          isVisible={isCategoryModalVisible}
          onClose={() => setIsCategoryModalVisible(false)}
          onSelect={(selectedCategory) => {
            setCategory(selectedCategory);
            setIsCategoryModalVisible(false);
          }}
        />
      </>
    );
  }
);

// Adiciona um nome de exibição para facilitar a depuração.
WordEditSheet.displayName = "WordEditSheet";

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32, // Este é o espaço que ficará abaixo do botão. Ajuste se necessário.
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: 2.5,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: theme.fontSizes["2xl"] },
  closeButton: { padding: 8, marginRight: -8 },
  form: { marginBottom: 0 },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: { color: theme.colors.textMuted, marginRight: 12 },
  input: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    paddingVertical: 14,
    fontFamily: theme.fonts.regular,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  buttonDisabled: { backgroundColor: theme.colors.disabled },
  saveButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSizes.lg,
    letterSpacing: 0.5,
  },
  categorySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  categorySelectorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  categoryText: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.text,
  },
  categoryPlaceholder: {
    fontSize: theme.fontSizes.base,
    color: theme.colors.placeholder,
  },
});

export default WordEditSheet;
