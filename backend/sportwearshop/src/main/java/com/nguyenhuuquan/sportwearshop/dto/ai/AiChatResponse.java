package com.nguyenhuuquan.sportwearshop.dto.ai;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class AiChatResponse {

    private String reply;
    private List<AiProductSuggestion> suggestions = new ArrayList<>();

    public static AiChatResponse of(String reply, List<AiProductSuggestion> suggestions) {
        AiChatResponse response = new AiChatResponse();
        response.setReply(reply);
        response.setSuggestions(suggestions == null ? new ArrayList<>() : suggestions);
        return response;
    }
}
