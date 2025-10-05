import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { theme } from '../../styles/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { FiX, FiImage, FiLock, FiUnlock, FiCopy } from 'react-icons/fi';
import { challengeService, type Challenge } from '../../services/challengeService';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div<{ colors: any }>`
  background: ${props => props.colors.surface};
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div<{ colors: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${props => props.colors.border};
`;

const ModalTitle = styled.h2<{ colors: any }>`
  color: ${props => props.colors.text};
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button<{ colors: any }>`
  background: none;
  border: none;
  color: ${props => props.colors.textLight};
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    color: ${props => props.colors.text};
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label<{ colors: any }>`
  display: block;
  color: ${props => props.colors.text};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Input = styled.input<{ colors: any }>`
  width: 100%;
  padding: 10px 15px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.colors.surface};
  color: ${props => props.colors.text};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.colors.textLight};
  }
`;

const TextArea = styled.textarea<{ colors: any }>`
  width: 100%;
  padding: 10px 15px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  background: ${props => props.colors.surface};
  color: ${props => props.colors.text};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.colors.textLight};
  }
`;

const Select = styled.select<{ colors: any }>`
  width: 100%;
  padding: 10px 15px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.colors.surface};
  color: ${props => props.colors.text};
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ImageUploadArea = styled.div<{ colors: any }>`
  width: 100%;
  height: 150px;
  border: 2px dashed ${props => props.colors.border};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.primary}05;
  }

  svg {
    font-size: 32px;
    color: ${props => props.colors.textLight};
  }

  span {
    font-size: 14px;
    color: ${props => props.colors.textLight};
  }
`;

const PreviewImage = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
`;

const PrivacyToggle = styled.div`
  display: flex;
  gap: 10px;
`;

const PrivacyOption = styled.button<{ active: boolean; colors: any }>`
  flex: 1;
  padding: 12px;
  border: 1px solid ${props => props.active ? theme.colors.primary : props.colors.border};
  background: ${props => props.active ? `${theme.colors.primary}10` : props.colors.surface};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${props => props.active ? theme.colors.primary : props.colors.textLight};
  font-size: 14px;
  font-weight: ${props => props.active ? '500' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const InviteCodeSection = styled.div<{ colors: any }>`
  padding: 15px;
  background: ${props => props.colors.background};
  border-radius: 8px;
  margin-top: 15px;
`;

const InviteCode = styled.div<{ colors: any }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 6px;
  margin-top: 10px;

  span {
    font-family: 'Courier New', monospace;
    font-size: 16px;
    font-weight: bold;
    color: ${theme.colors.primary};
    letter-spacing: 2px;
  }
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const ModalFooter = styled.div<{ colors: any }>`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 24px;
  border-top: 1px solid ${props => props.colors.border};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary'; colors: any }>`
  padding: 10px 24px;
  background: ${props => props.variant === 'secondary' ? props.colors.surface : theme.colors.primary};
  color: ${props => props.variant === 'secondary' ? props.colors.text : 'white'};
  border: ${props => props.variant === 'secondary' ? `1px solid ${props.colors.border}` : 'none'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    ${props => props.variant === 'secondary'
      ? `background: ${props.colors.background};`
      : `background: ${theme.colors.primaryDark}; transform: translateY(-1px); box-shadow: 0 4px 12px ${theme.colors.primary}40;`
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: ${theme.colors.error};
  font-size: 12px;
  margin-top: 5px;
  display: block;
`;

interface CreateChallengeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const userProfile = user;
  const { colors } = useThemeColors();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For students, challenges are always private
  const isStudent = userProfile?.type === 'aluno';
  const isAcademia = userProfile?.type === 'academia';

  const [formData, setFormData] = useState<Partial<Challenge>>({
    name: '',
    description: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    is_public: false, // Students: always private, Academia: can choose
    reward_points: 100, // Fixed at 100 points
    challenge_type: 'participation', // Fixed type
    target_value: undefined
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' && name !== 'target_value' ? Number(value) : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'A imagem deve ter no máximo 5MB' }));
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Data de término é obrigatória';
    } else if (new Date(formData.end_date) <= new Date()) {
      newErrors.end_date = 'Data de término deve ser após hoje';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      let imageUrl = undefined;
      if (imageFile && imagePreview) {
        // Use base64 image preview for now
        // TODO: Implement proper image upload to Supabase Storage in the future
        imageUrl = imagePreview;
      }

      const challengeData = {
        ...formData,
        image_url: imageUrl
      } as Omit<Challenge, 'id' | 'created_at' | 'updated_at'>;

      const result = await challengeService.createChallenge(challengeData, userProfile!);

      if (!formData.is_public && result.invite_code) {
        setInviteCode(result.invite_code);
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Erro ao criar desafio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    const link = `${window.location.origin}/challenges/join/${inviteCode}`;
    navigator.clipboard.writeText(link);
    alert('Link de convite copiado!');
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent colors={colors} onClick={(e) => e.stopPropagation()}>
        <ModalHeader colors={colors}>
          <ModalTitle colors={colors}>Criar Novo Desafio</ModalTitle>
          <CloseButton colors={colors} onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {inviteCode ? (
            <InviteCodeSection colors={colors}>
              <h3>Desafio criado com sucesso!</h3>
              <p>Compartilhe o código de convite com os participantes:</p>
              <InviteCode colors={colors}>
                <span>{inviteCode}</span>
                <CopyButton onClick={copyInviteCode}>
                  <FiCopy />
                  Copiar Link
                </CopyButton>
              </InviteCode>
            </InviteCodeSection>
          ) : (
            <>
              <FormGroup>
                <Label colors={colors}>Nome do Desafio *</Label>
                <Input
                  colors={colors}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Desafio 30 dias de treino"
                  maxLength={100}
                />
                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label colors={colors}>Descrição *</Label>
                <TextArea
                  colors={colors}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva o objetivo e as regras do desafio..."
                  maxLength={500}
                />
                {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label colors={colors}>Data de Término *</Label>
                <Input
                  colors={colors}
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
                {errors.end_date && <ErrorMessage>{errors.end_date}</ErrorMessage>}
                <small style={{ color: colors.textLight, marginTop: '8px', display: 'block' }}>
                  O desafio começa hoje e termina na data selecionada
                </small>
              </FormGroup>


              <FormGroup>
                <Label colors={colors}>Imagem do Desafio</Label>
                <ImageUploadArea colors={colors} onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <PreviewImage src={imagePreview} alt="Preview" />
                  ) : (
                    <>
                      <FiImage />
                      <span>Clique para fazer upload</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </ImageUploadArea>
                {errors.image && <ErrorMessage>{errors.image}</ErrorMessage>}
              </FormGroup>

              {isAcademia && (
                <InviteCodeSection colors={colors}>
                  <p style={{ fontSize: '14px', color: colors.textLight }}>
                    ℹ️ Seus desafios são sempre públicos e aparecem para todos os alunos da academia.
                  </p>
                </InviteCodeSection>
              )}

              {isStudent && (
                <InviteCodeSection colors={colors}>
                  <p style={{ fontSize: '14px', color: colors.textLight }}>
                    ⚠️ Como aluno, seus desafios são sempre privados. Após criar, você receberá um link de convite para compartilhar.
                  </p>
                </InviteCodeSection>
              )}

              {userProfile?.type === 'personal' && (
                <InviteCodeSection colors={colors}>
                  <p style={{ fontSize: '14px', color: colors.textLight }}>
                    ⚠️ Como personal, seus desafios são sempre privados. Após criar, você receberá um link de convite para compartilhar.
                  </p>
                </InviteCodeSection>
              )}
            </>
          )}
        </ModalBody>

        {!inviteCode && (
          <ModalFooter colors={colors}>
            <Button colors={colors} variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button colors={colors} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Desafio'}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateChallengeModal;