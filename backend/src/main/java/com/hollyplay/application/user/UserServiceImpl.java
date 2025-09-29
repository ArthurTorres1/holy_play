package com.hollyplay.application.user;

import com.hollyplay.application.user.dto.UpdateUserRequest;
import com.hollyplay.application.user.dto.UserRequest;
import com.hollyplay.application.user.dto.UserResponse;
import com.hollyplay.domain.user.User;
import com.hollyplay.exception.NotFoundException;
import com.hollyplay.infrastructure.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getNome(),
                user.getDataNascimento(),
                user.getCep(),
                user.getLogradouro(),
                user.getBairro(),
                user.getCidade(),
                user.getNumero(),
                user.getTelefone(),
                user.getDataCadastro(),
                user.getDataExpiracao(),
                user.getRole(),
                user.getStatus()
        );
    }

    @Override
    @Transactional
    public UserResponse create(UserRequest request) {
        User user = new User();
        user.setNome(request.nome());
        user.setDataNascimento(request.dataNascimento());
        user.setCep(request.cep());
        user.setLogradouro(request.logradouro());
        user.setBairro(request.bairro());
        user.setCidade(request.cidade());
        user.setNumero(request.numero());
        user.setTelefone(request.telefone());
        user.setDataExpiracao(request.dataExpiracao());
        user.setRole(request.role());
        user.setStatus(request.status());
        user = userRepository.save(user);
        return toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        return toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> list(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserServiceImpl::toResponse);
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        user.setNome(request.nome());
        user.setDataNascimento(request.dataNascimento());
        user.setCep(request.cep());
        user.setLogradouro(request.logradouro());
        user.setBairro(request.bairro());
        user.setCidade(request.cidade());
        user.setNumero(request.numero());
        user.setTelefone(request.telefone());
        user.setDataExpiracao(request.dataExpiracao());
        user.setRole(request.role());
        user.setStatus(request.status());
        user = userRepository.save(user);
        return toResponse(user);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("Usuário não encontrado");
        }
        userRepository.deleteById(id);
    }
}
