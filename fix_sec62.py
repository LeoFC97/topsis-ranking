path = r'C:\Users\HELDE\Dropbox\latex_nova\Topis_RAD_Working - Sem Telas\__sec___f__62_results_toy_B_upl.tex'

conclusion = """\n\\autoref{tab:toy_example_A_B} reveals a rank reversal: $A_7$, the top-ranked alternative under traditional TOPSIS, drops to 3\\textsuperscript{rd} place once $A_8$ is removed. Crucially, $A_7$ was never involved in the veto---it satisfies all $VPL$ thresholds---yet its ranking is substantially affected.

The explanation lies in how $A_8$ shaped the normalisation frontiers in Toy Example A. Alternative $A_8$ is an outlier in criterion $C_4$, with a value of $g_{8,C_4} = 200$ against a range of $65$--$100$ for all other alternatives. When $A_8$ is present, the $C_4$ column is normalised over the span $[65, 200]$, so the performances of the nine eligible alternatives are compressed into a narrow band near zero on that dimension. As a result, $C_4$ contributes very little to differentiate those alternatives, and $A_7$'s strength in $C_1$ and $C_2$ (where it achieves the column maximum) is sufficient to secure first place.

Once $A_8$ is removed by the $VPL$ filter, the $C_4$ span expands to $[65, 100]$. Alternatives with better $C_4$ values---particularly $A_5$, which achieves the new column maximum of 100---now receive normalised scores close to 1.0 on $C_4$, while $A_7$ (with $C_4 = 65$, the new column minimum) still receives 0. Moreover, $A_4$ now achieves the column maximum on $C_3$ ($g_{4,C_3} = 88$), receiving a normalised score of 1.0 on that criterion. The $C_4$ and $C_3$ dimensions now discriminate strongly among alternatives, and two of them ($A_5$ on $C_4$, $A_4$ on $C_3$) outperform $A_7$ in the overall score. In summary, $A_8$'s outlier value in $C_4$ was suppressing the $C_4$ contribution for all other alternatives; its removal unmasks that suppressed variation and changes the final recommendation.

This example demonstrates that applying a veto filter followed by a standard re-normalisation on the remaining subset can itself introduce rank reversals, even when the vetoed alternative is clearly inferior. The use of decision-maker-defined, \\emph{fixed} $DPL$ and $VPL$ frontiers as the normalisation boundaries---rather than data-driven column extremes---addresses this issue, as illustrated in Toy Example C.
"""

with open(path, encoding='utf-8') as f:
    lines = f.readlines()

# Keep only the first 139 lines (correct content up to \end{table})
good_lines = lines[:139]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(good_lines)
    f.write(conclusion)

total = sum(1 for _ in open(path, encoding='utf-8'))
print('Done. Lines:', total)
